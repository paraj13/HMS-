# chatbot/functions/order_food.py
from chatbot.utils.response_helpers import chatbot_response
from backend.constants import CATEGORY_ADD_ONS, TYPE_UPSELLS
from rooms.models import Meal, Order
from chatbot.functions.greeting import get_greeting

# ----------------- States -----------------
STATE_START = "start"
STATE_CATEGORY = "category"
STATE_MEAL_TYPE = "meal_type"
STATE_DIET_TYPE = "diet_type"
STATE_MEAL_LIST = "meal_list"
STATE_SELECT_ITEM = "select_item"
STATE_QUANTITY = "quantity"
STATE_MODIFIERS = "modifiers"
STATE_NOTE = "note"
STATE_UPSELL = "upsell"
STATE_DELIVERY = "delivery"
STATE_PAYMENT = "payment"
STATE_CONFIRM = "confirm"
STATE_COMPLETE = "complete"


# ----------------- Session -----------------
class OrderSession:
    def __init__(self):
        self.state = STATE_START
        self.category = None
        self.meal_type = None
        self.diet_type = None
        self.selected_meal = None
        self.quantity = 1
        self.add_ons = []
        self.note = None
        self.upsell = None
        self.delivery_info = {}
        self.payment_method = None
        self.meals_list = []


# ----------------- Helper Functions -----------------
def get_categories():
    return [c.lower() for c in Meal.objects.distinct("category") if c]

def get_meal_names():
    return [c.lower() for c in Meal.objects.distinct("name") if c]

def get_meal_types(category):
    return list(Meal.objects.filter(category__iexact=category, status=True).distinct("meal_type"))

def get_diet_types(category, meal_type):
    return list(
        Meal.objects.filter(
            category__iexact=category,
            meal_type__iexact=meal_type,
            status=True,
        ).distinct("diet_type")
    )

def get_meals(category, meal_type, diet_type=None):
    """Return meals, skipping diet_type filter if None."""
    query = Meal.objects.filter(
        category__iexact=category,
        meal_type__iexact=meal_type,
        status=True,
    )
    if diet_type:  # only filter diet if provided
        query = query.filter(diet_type__iexact=diet_type)
    return query


# ----------------- Main order flow -----------------
def order_food(session: OrderSession, user_input: str):
    text = user_input.lower().strip()

    # Clear session
    if text in ["clear", "reset", "start over"]:
        return chatbot_response(
            message="🧹 Session cleared. Let's start again. Please choose a category.",
            options=get_categories(),
        ), OrderSession()

    # ---------- START ----------
    if session.state == STATE_START:
        session.state = STATE_CATEGORY
        return chatbot_response(
            message="🍽️ Great! First, please choose a meal category.",
            options=get_categories(),
        ), session

    # ---------- CATEGORY ----------
    elif session.state == STATE_CATEGORY:
        categories = [c.lower() for c in get_categories()]
        if text in categories:
            session.category = text
            session.state = STATE_MEAL_TYPE
            return chatbot_response(
                message=f"Got it 👍 You chose '{text}'. Now pick a meal type:",
                options=get_meal_types(session.category),
            ), session
        return chatbot_response(
            message="Please select a valid category.",
            options=get_categories(),
        ), session

    # ---------- MEAL TYPE ----------
    elif session.state == STATE_MEAL_TYPE:
        meal_types = [m.lower() for m in get_meal_types(session.category)]
        if text in meal_types:
            session.meal_type = text

            # ✅ Skip diet step for dessert & beverage
            if session.meal_type in ["dessert", "beverage"]:
                meals = get_meals(session.category, session.meal_type, None)
                if not meals:
                    session.state = STATE_CATEGORY
                    return chatbot_response(
                        message="❌ Sorry, no meals found. Please choose a category again:",
                        options=get_categories(),
                    ), session

                session.meals_list = meals
                session.state = STATE_SELECT_ITEM
                options = [f"{m.name} - ${m.price}" for m in meals[:5]]
                return chatbot_response(
                    message="Here are the options I found 🍰🥤 Which one would you like?",
                    options=options,
                ), session

            # ✅ Normal flow for other meal types
            session.state = STATE_DIET_TYPE
            return chatbot_response(
                message="Okay ✅ What diet type do you prefer?",
                options=get_diet_types(session.category, session.meal_type),
            ), session

        return chatbot_response(
            message="Please select a valid meal type.",
            options=get_meal_types(session.category),
        ), session

    # ---------- DIET TYPE ----------
    elif session.state == STATE_DIET_TYPE:
        diet_types = [d.lower() for d in get_diet_types(session.category, session.meal_type)]
        if text in diet_types:
            session.diet_type = text

            meals = get_meals(session.category, session.meal_type, session.diet_type)
            if not meals:
                session.state = STATE_CATEGORY
                return chatbot_response(
                    message="❌ Sorry, no meals match that combination. Please choose a category again:",
                    options=get_categories(),
                ), session

            session.meals_list = meals
            session.state = STATE_SELECT_ITEM
            options = [f"{m.name} - ${m.price}" for m in meals[:5]]
            return chatbot_response(
                message="Here are the meals I found 🍛 Which one would you like?",
                options=options,
            ), session

        return chatbot_response(
            message="Please select a valid diet type.",
            options=get_diet_types(session.category, session.meal_type),
        ), session

    # ---------- SELECT ITEM ----------
    elif session.state == STATE_SELECT_ITEM:
        meals_dict = {f"{meal.name.lower()} - ${meal.price}".lower(): meal for meal in session.meals_list}
        selected = meals_dict.get(text)
        if not selected:
            return chatbot_response(
                message="❌ Please pick from the available meals.",
                options=[f"{m.name} - ${m.price}" for m in session.meals_list[:5]],
            ), session

        session.selected_meal = selected
        session.state = STATE_QUANTITY
        return chatbot_response(
            message=f"Got it: {selected.name}. How many portions?",
            options=[str(i) for i in range(1, 6)],
        ), session

    # ---------- QUANTITY ----------
    elif session.state == STATE_QUANTITY:
        if text.isdigit() and 1 <= int(text) <= 10:
            session.quantity = int(text)
            session.state = STATE_MODIFIERS
            add_ons = CATEGORY_ADD_ONS.get(session.category, [])
            options = [f"{a['name']} (+${a['price']})" for a in add_ons] + ["skip"]
            return chatbot_response(
                message=f"{session.quantity} x {session.selected_meal.name}. Any add-ons?",
                options=options,
            ), session
        return chatbot_response(message="Please enter a valid quantity (1-10)."), session

    # ---------- MODIFIERS ----------
    elif session.state == STATE_MODIFIERS:
        if text == "skip":
            session.add_ons = []
        else:
            selected_add_ons = []
            for add_on in CATEGORY_ADD_ONS.get(session.category, []):
                if add_on["name"].lower() in text:
                    selected_add_ons.append(add_on)
            session.add_ons = selected_add_ons

        session.state = STATE_NOTE
        return chatbot_response(
            message="Any special notes for the kitchen? (or type 'skip')"
        ), session

    # ---------- NOTE ----------
    elif session.state == STATE_NOTE:
        session.note = None if text == "skip" else text
        session.state = STATE_UPSELL
        upsells = TYPE_UPSELLS.get(session.meal_type, [])
        options = [f"{u['name']} (+${u['price']})" for u in upsells] + ["skip"]
        return chatbot_response(
            message="Would you like a drink with that?",
            options=options,
        ), session

    # ---------- UPSELL ----------
    elif session.state == STATE_UPSELL:
        if text != "skip":
            for u in TYPE_UPSELLS.get(session.meal_type, []):
                if u["name"].lower() in text:
                    session.upsell = u
                    break
        session.state = STATE_DELIVERY
        return chatbot_response(
            message="Please provide your room number and last name."
        ), session

    # ---------- DELIVERY ----------
    elif session.state == STATE_DELIVERY:
        parts = text.split()
        if len(parts) >= 2:
            session.delivery_info = {"room": parts[0], "last_name": " ".join(parts[1:])}
            session.state = STATE_PAYMENT
            return chatbot_response(
                message="How would you like to pay?",
                options=["Room charge", "Card"],
            ), session
        return chatbot_response(message="Please provide both room number and last name."), session

    # ---------- PAYMENT ----------
    elif session.state == STATE_PAYMENT:
        session.payment_method = text
        session.state = STATE_CONFIRM

        # Calculate price
        base_price = session.selected_meal.price * session.quantity
        add_ons_price = sum(a["price"] for a in session.add_ons)
        upsell_price = session.upsell["price"] if session.upsell else 0
        total = base_price + add_ons_price + upsell_price

        # Build structured summary with emojis
        summary_lines = [
            f"🍽️ {session.quantity} x {session.selected_meal.name} = ${base_price}"
        ]

        if session.add_ons:
            for a in session.add_ons:
                summary_lines.append(f"➕ {a['name']} (+${a['price']})")

        if session.upsell:
            summary_lines.append(f"✨ Upsell: {session.upsell['name']} (+${session.upsell['price']})")

        if session.note:
            summary_lines.append(f"📝 Note: {session.note}")

        delivery = f"🏨 Room {session.delivery_info.get('room')}, {session.delivery_info.get('last_name')}"

        # Final message
        return chatbot_response(
            message=(
                "📦 You're ordering:\n"
                + "\n".join(summary_lines)
                + f"\n\n🚚 Deliver to: {delivery}"
                + f"\n💳 Payment: {session.payment_method}"
                + f"\n💰 Total: {session.selected_meal.currency} {total}\n\n✅ Confirm?"
            ),
            options=["Yes", "No"],
        ), session

    # ---------- CONFIRM ----------
    elif session.state == STATE_CONFIRM:
        if "yes" in text:
            order = Order(
                meal=session.selected_meal,
                quantity=session.quantity,
                add_ons=[a["name"] for a in session.add_ons],
                upsell=session.upsell["name"] if session.upsell else None,
                note=session.note,
                delivery_info=session.delivery_info,
                payment_method=session.payment_method,
            )
            order.save()
            return chatbot_response(
                message="✅ Order placed successfully! 🙌 Anything else I can help you with?",
                options=get_greeting().get("options", []),
            ), OrderSession()
        else:
            session.state = STATE_CATEGORY
            return chatbot_response(
                message="Okay, let's start again. Please choose a category.",
                options=get_categories(),
            ), session

    return chatbot_response(message="I didn’t understand that."), session
