# chatbot/functions/greeting.py
from chatbot.utils.response_helpers import chatbot_response
from backend.constants import GREETING_OPTIONS

def get_greeting():
    return chatbot_response(
        message="👋 Hello! Welcome to our service. How can I assist you today?",
        options=GREETING_OPTIONS

    )

def get_goodbye():
    """
    Returns a professional goodbye message.
    """
    return chatbot_response(message="Goodbye! Have a nice day!")