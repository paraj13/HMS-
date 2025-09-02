import re
from ..models import Room, Service
from backend.constants import STATUS_VALUES, ROOM_TYPES, SERVICE_CATEGORIES

def parse_filters(text: str):
    filters = {}
    text = text.lower()
    conditions = [c.strip() for c in re.split(r'\band\b', text)]

    for cond in conditions:
        # String fields: status/type/category
        match = re.search(r"(status|type|category)\s+(?:is\s+)?([\w\d]+)", cond)
        if match:
            field, value = match.groups()
            filters[field] = value
            continue

        # Implicit status/type
        for status in STATUS_VALUES:
            if status in cond:
                filters["status"] = status
        for typ in ROOM_TYPES:
            if typ in cond:
                filters["type"] = typ
        for cat in SERVICE_CATEGORIES:
            if cat.lower() in text:
                filters["category"] = cat
                break


        # Numeric fields: price
        match = re.search(
            r"(price)\s*(?:is\s+)?(<=|>=|<|>|less than|greater than|less or equal|greater or equal)\s*([\d\.]+)", cond
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
        # match whole words
        if re.search(rf"\b{f}\b", text_lower):
            fields.append(f)
    if not fields:
        fields = available_fields  # default: all fields
    return fields

# --- Main dynamic response ---
def get_dynamic_response(text: str):
    text_lower = text.lower().strip()
    response_text = "Sorry, I didn't understand that."
    action = None

    model_keywords = [
        {"keywords": ["room", "rooms"], "model": Room, "fields": ["number", "type", "status", "price"], "route": "rooms"},
        {"keywords": ["service", "services"], "model": Service, "fields": ["name", "category", "price"], "route": "services"},
    ]

    for item in model_keywords:
        if any(kw in text_lower for kw in item["keywords"]):
            # --- Apply filters ---
            filters = parse_filters(text_lower)
            requested_fields = parse_requested_fields(text_lower, item["fields"])
            
            objs = item["model"].objects.filter(**filters)

            if objs:
                entries = []
                for obj in objs:
                    vals = [str(getattr(obj, f)) for f in requested_fields]
                    entries.append(" - ".join(vals))
                
                # Remove duplicates if user only asked for a single field
                if len(requested_fields) == 1:
                    entries = list(dict.fromkeys(entries))
                
                response_text = f"Here are the available {item['keywords'][0]}:\n" + "\n".join([f"● {e}" for e in entries])
            else:
                response_text = f"No {item['keywords'][0]} found."

            action = item["route"]
            return response_text, action

    # --- Greetings ---
    if "hi" in text_lower or "hello" in text_lower:
        response_text = "Hello! How can I help you today?"

    return response_text, action
