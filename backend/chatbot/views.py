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


# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from retell import Retell

# Initialize client with API key
client = Retell(api_key=os.getenv("RETELL_API_KEY"))

@csrf_exempt
def create_chat(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        # body = json.loads(request.body.decode("utf-8"))
        agent_id = "agent_fe23290c453ecbcdf141bd322b"
        # agent_version = body.get("agent_version", 1)
        # metadata = body.get("metadata", {})
        # retell_vars = body.get("retell_llm_dynamic_variables", {})

        if not agent_id:
            return JsonResponse({"error": "agent_id is required"}, status=400)

        chat_response = client.chat.create(
            agent_id=agent_id,
            # agent_version=agent_version,
            # metadata=metadata,
            # retell_llm_dynamic_variables=retell_vars,
        )

        return JsonResponse(chat_response.dict(), status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def create_chat_completion(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8"))
        chat_id = body.get("chat_id")
        content = body.get("content")

        if not chat_id or not content:
            return JsonResponse({"error": "chat_id and content are required"}, status=400)

        # Call Retell SDK
        response = client.chat.create_chat_completion(
            chat_id=chat_id,
            content=content,
        )

        # response is a pydantic model, convert to dict
        return JsonResponse(response.dict(), status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt
def list_chats(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status=405)

    try:
        chat_responses = client.chat.list()
        # This returns a Pydantic model list, convert each item to dict
        return JsonResponse([chat.dict() for chat in chat_responses], safe=False, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def end_chat(request, chat_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        client.chat.end(chat_id)
        return JsonResponse({"message": f"Chat {chat_id} ended successfully."}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt
def retrieve_chat(request, chat_id):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status=405)
    try:
        chat_response = client.chat.retrieve(chat_id)
        return JsonResponse(chat_response.dict(), status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
