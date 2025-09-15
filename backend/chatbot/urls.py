from django.urls import path
from .views import ChatbotView, create_chat, retell_create_chat_completion

urlpatterns = [
    path("voice-chat/", ChatbotView.as_view(), name="voice_chat"),
    path('create-chat/', create_chat, name='create_chat'),
    path("create-chat-completion/", retell_create_chat_completion, name="retell_create_chat_completion"),
]
