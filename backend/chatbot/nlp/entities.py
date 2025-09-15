# chatbot/nlp/entities.py
from backend.constants import ROOM_TYPES, SERVICE_CATEGORIES, DIET_TYPES, CUISINE_TYPES, SPICE_LEVELS,MEAL_TYPES
from rooms.models import Meal

def get_meal_categories():
    """Fetch distinct meal categories from the database dynamically in lowercase."""
    categories = Meal.objects.distinct("category")
    return [c.lower() for c in categories if c]

def get_meal_names():
    """Fetch distinct meal names from the database dynamically in lowercase."""
    names = Meal.objects.distinct("name")
    return [n.lower() for n in names if n]

# -----------------------------
# Entity Map
# -----------------------------
ENTITY_MAP = {
    "name": get_meal_names(),
    "type": ROOM_TYPES,
    "category": SERVICE_CATEGORIES,
    "meal_type": MEAL_TYPES,
    "category": get_meal_categories(),
    "diet_type": DIET_TYPES,
    "cuisine_type": CUISINE_TYPES,
    "spice_level": SPICE_LEVELS,
}

def find_entity(entity_type: str, text: str):
    """Return single entity match for a given type."""
    options = ENTITY_MAP.get(entity_type, [])
    for option in options:
        if option and option.lower() in text.lower():
            return option
    return None

def extract_entities(text: str) -> dict:
    """
    Extract all possible entities from the user text.
    Example: "book a spicy Indian meal" ->
        {"meal": "meal", "cuisine": "indian", "spice": "spicy"}
    """
    results = {}
    for entity_type in ENTITY_MAP.keys():
        match = find_entity(entity_type, text)
        if match:
            results[entity_type] = match
    return results
