from mongoengine.queryset.visitor import Q
from rooms.models import Service
from chatbot.utils.response_helpers import chatbot_response
from backend.constants import SERVICE_CATEGORIES


def list_services(query_text: str, extra_filters: dict | None = None):
    query = query_text.lower().strip()
    filters = extra_filters.copy() if extra_filters else {}

    # 1️⃣ Match query against service categories
    matched_categories = [cat for cat in SERVICE_CATEGORIES if cat in query]
    if matched_categories:
        filters["name__iexact"] = matched_categories[0]  # exact match for first category

    # 2️⃣ No keywords or filters → show all categories
    if not filters and not matched_categories:
        return chatbot_response(
            message=(
                "🛎️ Here are the available hotel services:\n"
            ),
            options=SERVICE_CATEGORIES,
            response_type="message"
        ), "list_services"

    # 3️⃣ Query DB
    services = Service.objects(**filters)

    # 4️⃣ Fallback: search by keywords in name/description
    if not services and matched_categories:
        q_filter = Q()
        for kw in matched_categories:
            q_filter |= Q(name__icontains=kw) | Q(description__icontains=kw)
        services = Service.objects(q_filter, **filters)

    # 5️⃣ No services found
    if not services:
        return chatbot_response(
            message="❌ No services found for your request.\nHere are the available service options:",
            suggestions=SERVICE_CATEGORIES,
            response_type="error"
        ), "list_services"

    # 6️⃣ Build structured response
    service_list = [
        {"name": f"{s.name} - ₹{s.price}", "link": f"/services/detail/{s.id}/"}
        for s in services
    ]

    return chatbot_response(
        message="🛎️ Here are the available services:\n",
        suggestions=service_list,
        response_type="message"
    ), "list_services"
