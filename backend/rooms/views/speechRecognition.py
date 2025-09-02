import os
import speech_recognition as sr
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .chatbot import get_dynamic_response


@csrf_exempt
def voice_to_text(request):
    try:
        if request.method == "POST":
            text_input = request.POST.get("text", None)

            # If audio provided, convert to text
            if "audio" in request.FILES:
                audio_file = request.FILES["audio"]
                r = sr.Recognizer()
                with sr.AudioFile(audio_file) as source:
                    audio_data = r.record(source)
                text_input = r.recognize_google(audio_data)

            if not text_input:
                return JsonResponse({"error": "No input provided"}, status=400)

            answer, action = get_dynamic_response(text_input)

            return JsonResponse({
                "transcription": text_input,
                "answer": answer,
                "action": action
            })

        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    except sr.UnknownValueError:
        return JsonResponse({"error": "Could not understand the audio"}, status=400)
    except sr.RequestError as e:
        return JsonResponse({"error": f"Google API error: {e}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
