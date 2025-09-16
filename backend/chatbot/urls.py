from django.urls import path
from .views import ChatbotView,create_chat,create_chat_completion,list_chats,end_chat,retrieve_chat

urlpatterns = [
    path("voice-chat/", ChatbotView.as_view(), name="voice_chat"),
    path('create-chat/', create_chat, name='create_chat'),
    # path("create-chat-completion/", retell_create_chat_completion, name="retell_create_chat_completion"),
    
    
    path("create-chat/", create_chat, name="create_chat"),
    path("create-chat-completion/", create_chat_completion, name="create_chat_completion"),
    path("list-chats/", list_chats, name="list_chats"),
    path("end-chat/<str:chat_id>/", end_chat, name="end_chat"),
    path("retrieve-chat/<str:chat_id>/", retrieve_chat, name="retrieve_chat"),


]
