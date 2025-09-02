from rooms.models import Room, Service, Meal  # adjust imports
from chatbot.utils.response_helpers import chatbot_response



def ask_for_clarification(user_message: str) -> str:
    """
    Suggest accurate items or categories based on DB and user input.
    Prioritize exact matches first, then partial matches.
    """
    user_message_lower = user_message.strip().lower()
    
    # Fetch all items from DB
    rooms = Room.objects.distinct('type')
    services = Service.objects.distinct('category') + Service.objects.distinct('name')
    meals = Meal.objects.distinct('category') + Meal.objects.distinct('name')
    
    # Combine with labels
    suggestions = []
    for r in rooms:
        suggestions.append((r, "Room Type"))
    for s in services:
        suggestions.append((s, "Service"))
    for m in meals:
        suggestions.append((m, "Meal"))
    
    # Separate exact matches and partial matches
    exact_matches = [f"{name} ({label})" for name, label in suggestions if user_message_lower == name.lower()]
    partial_matches = [f"{name} ({label})" for name, label in suggestions if user_message_lower in name.lower() and user_message_lower != name.lower()]
    
    # Merge results: exact matches first
    final_suggestions = exact_matches + partial_matches
    final_suggestions = final_suggestions[:7]  # limit suggestions
    
    if not final_suggestions:
        return chatbot_response(
            # message='❌ Sorry I didn’t fully understand \"{user_message}\"',
            message = f"❌ Sorry I didn’t understand \"{user_message}\"\n 🤔You can try asking about",
            suggestions=["🍽️ meals", "🛏️ rooms", "🛎️ services"],
            response_type="error"
        )

# 2️⃣ Suggestion response
    return chatbot_response(
        message='🤔 Did you mean one of these?',
        suggestions=final_suggestions,
        response_type="suggestion"
    )
