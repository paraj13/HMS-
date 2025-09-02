# chatbot/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.authentication import JWTAuthentication
from accounts.permissions import RolePermission
from chatbot.utils.voice_utils import audio_to_text

from chatbot.nlp.intent import get_intent
from chatbot.nlp.entities import extract_entities  
from chatbot.nlp.router import handle_intent
from chatbot.nlp.clarification import ask_for_clarification


class ChatbotView(APIView):
    def post(self, request):
        text_input = request.data.get("text")

        if "audio" in request.FILES:
            text_input = audio_to_text(request.FILES["audio"])

        if not text_input:
            return Response({"error": "No input provided"}, status=400)

        text_lower = text_input.lower()

        # Step 1: Predict intent
        intent, confidence = get_intent(text_lower)

        # Step 2: Extract entities (dictionary)
        entities = extract_entities(text_lower)

        # Step 3: Route to proper handler
        answer, action = handle_intent(intent, confidence, text_lower, entities, request.user)

        # Step 4: Fallback → clarification
        if not answer:
            answer = ask_for_clarification(text_lower)

        return Response({
            "transcription": text_input,
            "answer": answer,
            "action": action,
            "intent": intent,
            "confidence": round(confidence, 2),
            "entities": entities,
        })
