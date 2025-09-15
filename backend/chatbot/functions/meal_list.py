from mongoengine.queryset.visitor import Q
from rooms.models import Meal
from backend.constants import MEAL_KEYWORDS, MEAL_TYPES, DIET_TYPES, CUISINE_TYPES, SPICE_LEVELS, MEAL_CATEGORIES
from chatbot.utils.response_helpers import chatbot_response
from chatbot.nlp.entities import get_meal_categories, get_meal_names
from chatbot.functions.order_food import get_categories
import re
from rapidfuzz import fuzz, process  # typo-tolerant fuzzy matching


def list_meals(query_text: str, extra_filters: dict | None = None):
    query = query_text.lower().strip()
    filters = extra_filters.copy() if extra_filters else {}

    # ---------- 1️⃣ Price filters ----------
    price_match = re.search(r"(?:under|below|less than)\s*([\d\.]+)", query)
    if price_match:
        filters["price__lt"] = float(price_match.group(1))
    exact_price_match = re.search(r"price\s*:\s*([\d\.]+)", query)
    if exact_price_match:
        filters["price"] = float(exact_price_match.group(1))

    # ---------- 2️⃣ Map keywords to fields ----------
    keyword_to_field = {
        "name": get_meal_names(),
        "meal_type": MEAL_TYPES,
        "diet_type": DIET_TYPES,
        "cuisine_type": CUISINE_TYPES,
        "spice_level": SPICE_LEVELS,
        "category": get_meal_categories(),
        "is_special": ["yes", "no"]
    }

    matched_category = None
    for field, options in keyword_to_field.items():
        for option in options:
            if option.lower() in query:
                if field == "is_special":
                    filters[field] = option.lower() == "yes"
                else:
                    filters[field] = option.lower()
                if field == "category":
                    matched_category = option

    # ---------- 3️⃣ Keyword search ----------
    keyword_filters = [kw.lower() for kw in MEAL_KEYWORDS if kw.lower() in query]

    # ---------- 4️⃣ If NO filters → return categories ----------
    if not filters:
        categories = get_categories()
        category_list = categories
        return chatbot_response(
            message="🍽️ Please select a meal category to see available dishes:",
            options=category_list,
            response_type="message"
        ), "meals"

    # ---------- 5️⃣ MongoEngine Query ----------
    meals = Meal.objects(**filters)

    # ---------- 6️⃣ Multi-meal direct search with fuzzy matching ----------
    if not meals:
        meal_names = get_meal_names()
        matched_meals = []
        parts = [p.strip() for p in re.split(r"\band\b|,", query)]
        for part in parts:
            best_match = process.extractOne(part, meal_names, scorer=fuzz.partial_ratio)
            if best_match and best_match[1] >= 70:
                found = Meal.objects(name__iexact=best_match[0])
                matched_meals.extend(found)
        if matched_meals:
            meals = matched_meals

    # ---------- 7️⃣ Direct category name search ----------
    if not meals:
        categories = get_meal_categories()
        for category in categories:
            if category.lower() == query:
                meals = Meal.objects(category__iexact=category)
                matched_category = category
                break

    # ---------- 8️⃣ Keyword fallback ----------
    if keyword_filters and not meals:
        q_filter = Q()
        for kw in keyword_filters:
            q_filter |= Q(name__icontains=kw) | Q(description__icontains=kw) | Q(category__icontains=kw)
        meals = Meal.objects(q_filter, **filters)

    # ---------- 9️⃣ No meals found ----------
    if not meals:
        return chatbot_response(
            message=f"❌ No meals found for your request. Here are available meal categories:",
            options=get_meal_categories(),
            response_type="error"
        ), "meals"

    # ---------- 🔟 Build structured response ----------
    meals_list = [
        {"name": f"{meal.name} - {meal.currency} {meal.price}", "link": f"/meals/detail/{meal.id}/"}
        for meal in meals
    ]

    # ---------- 1️⃣1️⃣ Response message ----------
    if matched_category:
        response_text = f"🍽️ Here are the meals in **{matched_category}** category:\n"
    else:
        response_text = "🍽️ Here are the matching meals:\n"

    # response_text += "\n👉 Would you like to order any of these meals? Just say *order meal* and pick your choice."

    return chatbot_response(
        message=response_text,
        suggestions=meals_list,
        response_type="message"
    ), "meals"
