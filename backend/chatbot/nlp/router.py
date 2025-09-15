# chatbot/functions/handle_intent.py
import uuid
from chatbot.functions.room_list import list_rooms
from chatbot.functions.service_list import list_services
from chatbot.functions.service_booking import book_service, ServiceBookingSession
from chatbot.functions.meal_list import list_meals
from chatbot.functions.order_food import order_food, OrderSession
from chatbot.functions.room_booking import book_room, RoomBookingSession
from chatbot.functions.greeting import get_greeting
from backend.constants import MEAL_KEYWORDS, SERVICE_CATEGORIES, GREETING_OPTIONS, ROOM_TYPES
from chatbot.functions.order_food import get_meal_names

MEAL_KEYWORDS = MEAL_KEYWORDS + get_meal_names()
INTENT_THRESHOLD = 0.1

# Store sessions per session_id
user_sessions = {}

def handle_intent(intent, confidence, text_lower, entities, session_id: str):
    """
    Decide what to do based on intent and confidence.
    Returns (answer, action).
    """
    print(f"Intent: {intent}, Confidence: {confidence}, Text: {text_lower}, Entities: {entities}, Session: {session_id}")

    # ------------------- CLEAR SESSION -------------------
    if any(kw in text_lower for kw in ["clear", "reset", "start over"]):
        user_sessions.pop(session_id, None)
        greeting = get_greeting()
        return {
            "message": "🧹 Session cleared! " + greeting.get("message", ""),
            "options": greeting.get("options", [])
        }, "reset"

    # ------------------- IF ALREADY IN A FLOW -------------------
    session = user_sessions.get(session_id)

    if isinstance(session, OrderSession):
        answer, session = order_food(session, text_lower)
        user_sessions[session_id] = session
        return answer, "ordering"

    if isinstance(session, ServiceBookingSession):
        answer, session = book_service(session, text_lower)
        user_sessions[session_id] = session
        return answer, "booking_service"

    if isinstance(session, RoomBookingSession):
        answer, session = book_room(session, text_lower)
        user_sessions[session_id] = session
        return answer, "booking_room"

    # ------------------- GREETINGS -------------------
    if (intent == "greetings" and confidence >= INTENT_THRESHOLD) or any(
        kw in text_lower for kw in ["hi", "hello", "hey there", "good morning"]
    ):
        return get_greeting(), "greeting"

    # ------------------- ORDER MEAL -------------------
    if intent == "order_food":
        session = user_sessions.get(session_id) or OrderSession()
        answer, session = order_food(session, text_lower)
        user_sessions[session_id] = session
        return answer, "ordering"

    # ------------------- LIST MEALS -------------------
    if (intent == "list_meal" and confidence >= INTENT_THRESHOLD) or any(
        kw in text_lower for kw in MEAL_KEYWORDS
    ):
        return list_meals(text_lower, extra_filters=entities)

    # ------------------- LIST ROOMS -------------------
    if intent == "list_rooms" and confidence >= INTENT_THRESHOLD or any(
        kw in text_lower for kw in ROOM_TYPES
    ):
        return list_rooms(text_lower, extra_filters=entities)

    # ------------------- BOOK ROOM -------------------
    if intent == "book_room" and confidence >= INTENT_THRESHOLD:
        session = user_sessions.get(session_id) or RoomBookingSession()
        answer, session = book_room(session, text_lower)
        user_sessions[session_id] = session
        return answer, "booking_room"

    # ------------------- LIST SERVICES -------------------
    if (intent == "list_services" and confidence >= INTENT_THRESHOLD) or any(
        kw in text_lower for kw in SERVICE_CATEGORIES
    ):
        return list_services(text_lower, extra_filters=entities)

    # ------------------- BOOK SERVICE -------------------
    if intent == "book_service" and confidence >= INTENT_THRESHOLD:
        session = user_sessions.get(session_id) or ServiceBookingSession()
        answer, session = book_service(session, text_lower)
        user_sessions[session_id] = session
        return answer, "booking_service"

    # ------------------- FALLBACK -------------------
    return {
        "message": "🤔 I didn’t understand that. You can try asking:",
        "options": GREETING_OPTIONS
    }, "unknown"
