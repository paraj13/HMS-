from chatbot.functions.service_list import list_items
from chatbot.functions.service_booking import book_service
from chatbot.functions.meal_list import list_meals
from backend.constants import MEAL_KEYWORDS
from chatbot.nlp.entities import get_meal_categories
from chatbot.nlp.entities import get_meal_names

all_meal_keywords = get_meal_names() + MEAL_KEYWORDS + get_meal_categories()

INTENT_THRESHOLD = 0.55

def handle_intent(intent, confidence, text_lower, entities, user):
    """
    Decides what to do based on intent and confidence.
    Returns (answer, action).
    """
    print(intent)
    answer, action = None, None
    if (intent == "list_meals" and confidence >= INTENT_THRESHOLD) or any(k in text_lower for k in all_meal_keywords):
        answer, action = list_meals(text_lower, extra_filters=entities)
    elif intent == "list_rooms" and confidence >= INTENT_THRESHOLD:
        answer, action = list_items(text_lower)
    elif intent == "list_services" and confidence >= INTENT_THRESHOLD:
        answer, action = list_items(text_lower)
    elif intent == "book_meal" and confidence >= INTENT_THRESHOLD:
        answer = "Sure, I can help you book a meal. Which date and time?"
        action = "booking"
    elif intent == "book_room" and confidence >= INTENT_THRESHOLD:
        answer = "Great, booking a room—what dates do you prefer?"
        action = "booking"
    elif intent == "book_service" and confidence >= INTENT_THRESHOLD:
        booking, answer = book_service(user, text_lower)
        action = "booking"
    elif intent == "greetings" and confidence >= INTENT_THRESHOLD:
        answer = "Hello! How can I help you today?"
    elif intent == "help" and confidence >= INTENT_THRESHOLD:
        answer = "You can ask me to list meals, rooms, services, or make a booking."

    return answer, action


