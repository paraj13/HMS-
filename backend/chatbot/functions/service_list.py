import re
from rooms.models import Room, Service
from backend.constants import STATUS_VALUES, ROOM_TYPES, SERVICE_CATEGORIES

# --- Parse filters from user text ---
def parse_filters(text: str):
    filters = {}
    text = text.lower()

    # --- handle "where" clauses ---
    where_match = re.findall(r"(status|type|category|price)\s+(?:is\s+)?([\w\d\.]+)", text)
    for field, value in where_match:
        if field == "price":
            try:
                filters[field] = float(value)
            except ValueError:
                continue
        else:
            filters[field] = value
    # -----------------------------

    conditions = [c.strip() for c in re.split(r'\band\b', text)]

    for cond in conditions:
        # Exact field match (status/type/category already handled above, but keep fallback)
        match = re.search(r"(status|type|category)\s+(?:is\s+)?([\w\d]+)", cond)
        if match:
            field, value = match.groups()
            filters[field] = value
            continue

        # Implicit fields
        for status in STATUS_VALUES:
            if status in cond:
                filters["status"] = status
        for typ in ROOM_TYPES:
            if typ in cond:
                filters["type"] = typ
        for cat in SERVICE_CATEGORIES:
            if cat.lower() in cond:
                filters["category"] = cat
                break

        # Numeric field: price with operators
        match = re.search(
            r"(price)\s*(?:is\s+)?(<=|>=|<|>|less than|greater than|less or equal|greater or equal)\s*([\d\.]+)",
            cond,
        )
        if match:
            field, op, value = match.groups()
            value = float(value)
            if op in ["<", "less than"]:
                filters[f"{field}__lt"] = value
            elif op in ["<=", "less or equal"]:
                filters[f"{field}__lte"] = value
            elif op in [">", "greater than"]:
                filters[f"{field}__gt"] = value
            elif op in [">=", "greater or equal"]:
                filters[f"{field}__gte"] = value
            continue

    return filters



# --- Parse requested fields ---
def parse_requested_fields(text: str, available_fields: list):
    fields = []
    text_lower = text.lower()
    for f in available_fields:
        if re.search(rf"\b{f}\b", text_lower):
            fields.append(f)
    if not fields:
        fields = available_fields  # default: all fields
    return fields


# --- List items (rooms/services) dynamically ---
def list_items(text: str):
    """
    Handles multi-field filtering and listing for rooms/services
    """
    text_lower = text.lower()
    response_text = "Sorry, I didn't understand that."
    action = None

    model_keywords = [
        {"keywords": ["room", "rooms"], "model": Room, "fields": ["number", "type", "status", "price"], "route": "rooms"},
        {"keywords": ["service", "services"], "model": Service, "fields": ["name", "category", "price"], "route": "services"},
    ]

    for item in model_keywords:
        if any(kw in text_lower for kw in item["keywords"]):
            filters = parse_filters(text_lower)
            requested_fields = parse_requested_fields(text_lower, item["fields"])

            objs = item["model"].objects.filter(**filters)

            if objs:
                entries = []
                for obj in objs:
                    vals = [str(getattr(obj, f)) for f in requested_fields]
                    entries.append(" - ".join(vals))

                if len(requested_fields) == 1:
                    entries = list(dict.fromkeys(entries))  # remove duplicates

                response_text = f"Here are the available {item['keywords'][0]}:\n" + "\n".join([f"● {e}" for e in entries])
            else:
                response_text = f"No {item['keywords'][0]} found."

            action = item["route"]
            return response_text, action

    # Greetings
    if "hi" in text_lower or "hello" in text_lower:
        response_text = "Hello! How can I help you today?"

    return response_text, action
