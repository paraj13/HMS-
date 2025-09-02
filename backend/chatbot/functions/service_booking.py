import re
import datetime
from rooms.models import Service, ServiceBooking

def book_service(user, text):
    """
    Books a service based on service_id or name, with optional date/time.
    """
    text_lower = text.lower()

    # --- 1. Try to extract service ID ---
    service = None
    service_id_match = re.search(r"service\s*(\d+)", text_lower)
    if service_id_match:
        try:
            service_id = int(service_id_match.group(1))
            service = Service.objects.filter(id=service_id).first()
        except (ValueError, TypeError):
            service = None

    # --- 2. If no ID, try by service name (fuzzy match) ---
    if not service:
        cleaned_text = re.sub(r"\b(book|reserve|service)\b", "", text_lower).strip()

        if not cleaned_text:
            return None, "Which service would you like to book? Please provide a service name or ID."

        matches = Service.objects.filter(name__icontains=cleaned_text)

        if not matches:
            return None, f"Sorry, I couldn’t find any service matching '{cleaned_text}'. Please try again with a valid service name."

        if matches.count() > 1:
            options = "\n".join([f"• {s.name} (ID: {s.id})" for s in matches])
            return None, f"I found multiple services matching '{cleaned_text}'. Please specify one:\n{options}"

        # Exactly one match → select it
        service = matches.first()

    # --- 3. If still no service ---
    if not service:
        return None, "Service not found. Please specify a valid service name or ID."

    # --- 4. Extract date/time if provided ---
    date_match = re.search(r"on (\d{4}-\d{2}-\d{2})", text_lower)
    time_match = re.search(r"at (\d{2}:\d{2})", text_lower)

    date_str = date_match.group(1) if date_match else str(datetime.date.today())
    time_str = time_match.group(1) if time_match else "12:00"

    # --- 5. Create booking ---
    booking = ServiceBooking(
        user=user,
        service=service,
        date=date_str,
        time=time_str,
        status="pending"
    )
    booking.save()

    return booking, f"✅ Service '{service.name}' booked for {date_str} at {time_str}."
