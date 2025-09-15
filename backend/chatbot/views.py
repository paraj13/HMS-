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


import json
import requests
from django.conf import settings
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def create_chat(request: HttpRequest) -> JsonResponse:
    """
    Creates a new chat session with Retell API.
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        data = json.loads(request.body)
        agent_id = data.get("agent_id")
        agent_version = data.get("agent_version", 1)
        metadata = data.get("metadata", {})
        retell_llm_dynamic_variables = data.get("retell_llm_dynamic_variables", {})

        if not agent_id:
            return JsonResponse({"error": "agent_id is required"}, status=400)

        url = f"{settings.RETELL_API_URL}/create-chat"
        headers = {
            "Authorization": f"Bearer {settings.RETELL_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "agent_id": agent_id,
            "agent_version": agent_version,
            "metadata": metadata,
            "retell_llm_dynamic_variables": retell_llm_dynamic_variables
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 201:
            return JsonResponse(
                {
                    "error": "Retell API request failed",
                    "status_code": response.status_code,
                    "response": response.text
                },
                status=response.status_code
            )

        return JsonResponse(response.json(), safe=False, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)
    except requests.RequestException as e:
        return JsonResponse({"error": f"HTTP request failed: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def retell_create_chat_completion(request: HttpRequest) -> JsonResponse:
    """
    Sends a user message to Retell API and returns the chat completion response.
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        data = json.loads(request.body)
        chat_id = data.get("chat_id")
        user_message = data.get("content")

        if not chat_id or not user_message:
            return JsonResponse({"error": "chat_id and content are required"}, status=400)

        url = f"{settings.RETELL_API_URL}/create-chat-completion"
        headers = {
            "Authorization": f"Bearer {settings.RETELL_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "chat_id": chat_id,
            "content": user_message
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 201:
            return JsonResponse(
                {
                    "error": "Retell API request failed",
                    "status_code": response.status_code,
                    "response": response.text
                },
                status=response.status_code
            )

        return JsonResponse(response.json(), safe=False, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)
    except requests.RequestException as e:
        return JsonResponse({"error": f"HTTP request failed: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
