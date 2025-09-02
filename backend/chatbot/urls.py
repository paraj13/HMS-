from django.urls import path
from .views import ChatbotView

urlpatterns = [
    path("voice-chat/", ChatbotView.as_view(), name="voice_chat"),
]
