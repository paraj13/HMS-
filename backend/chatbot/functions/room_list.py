from mongoengine.queryset.visitor import Q
from rooms.models import Room
from chatbot.utils.response_helpers import chatbot_response
import re
from backend.constants import ROOM_KEYWORDS, ROOM_TYPES

ROOM_STATUS = ["available", "booked", "occupied", "maintenance"]

def list_rooms(query_text: str, extra_filters: dict | None = None):
    query = query_text.lower().strip()
    filters = extra_filters.copy() if extra_filters else {}

    # ---------- 1️⃣ Price filters ----------
    price_match = re.search(r"(?:under|below|less than)\s*([\d\.]+)", query)
    if price_match:
        filters["price__lt"] = float(price_match.group(1))

    exact_price_match = re.search(r"price\s*:\s*([\d\.]+)", query)
    if exact_price_match:
        filters["price"] = float(exact_price_match.group(1))

    # ---------- 2️⃣ Room type filters ----------
    matched_room_type = None
    for room_type in ROOM_TYPES:
        if room_type.lower() in query:
            filters["type__iexact"] = room_type
            matched_room_type = room_type
            break

    # ---------- 3️⃣ Status filters ----------
    for status in ROOM_STATUS:
        if status in query:
            filters["status__iexact"] = status

    # ---------- 4️⃣ Keyword search ----------
    keyword_filters = [kw for kw in ROOM_KEYWORDS if kw in query]

    # ---------- 5️⃣ Case: No filters & No keywords ----------
    if not filters and not keyword_filters:
        # Show clickable room types
        room_type_list = [{"name": rt, "link": f"/rooms/list/{rt.lower()}/"} for rt in ROOM_TYPES]
        return chatbot_response(
            message="🏨 Please select a room type to see available rooms:",
            suggestions=room_type_list,
            response_type="message"
        ), "list_rooms"

    try:
        # ---------- 6️⃣ MongoEngine Query ----------
        rooms = Room.objects(**filters)

        # ---------- 7️⃣ Fallback search by keywords ----------
        if not rooms and keyword_filters:
            q_filter = Q()
            for kw in keyword_filters:
                q_filter |= Q(type__icontains=kw)
                if hasattr(Room, "status"):
                    q_filter |= Q(status__icontains=kw)
            rooms = Room.objects(q_filter, **filters)

    except Exception as e:
        return chatbot_response(
            message=f"⚠️ Error while searching rooms: {str(e)}",
            suggestions=ROOM_TYPES,
            response_type="error"
        ), "list_rooms"

    # ---------- 8️⃣ No rooms found ----------
    if not rooms:
        return chatbot_response(
            message=f"❌ No rooms found matching your request.",
            suggestions=ROOM_TYPES,
            response_type="error"
        ), "list_rooms"

    # ---------- 9️⃣ Build structured response ----------
    room_list = []
    for room in rooms:
        name = f"Room {getattr(room, 'number', 'N/A')} ({getattr(room, 'type', 'Unknown')})"
        if hasattr(room, "price"):
            name += f" - ₹{room.price}"
        room_list.append({
            "name": name,
            "link": f"/rooms/detail/{room.id}/"
        })

    # ---------- 🔟 Response message ----------
    if matched_room_type:
        response_msg = f"🏨 Here are the available **{matched_room_type} rooms**:\n"
    else:
        response_msg = "🏨 Here are the matching rooms:\n"

    return chatbot_response(
        message=response_msg,
        suggestions=room_list,
        response_type="message"
    ), "list_rooms"
