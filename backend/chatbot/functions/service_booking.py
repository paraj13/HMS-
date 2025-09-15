from chatbot.utils.response_helpers import chatbot_response


class ServiceBookingSession:
    def __init__(self):
        self.selected_service = None
        self.date = None
        self.time = None
        self.confirmed = False


def book_service(session: ServiceBookingSession, text_lower: str):
    """
    Handles multi-step booking flow for services.
    """
    # Step 1: Select service
    if not session.selected_service:
        session.selected_service = text_lower.strip()
        return chatbot_response(
            message=f"📅 When would you like to book the {session.selected_service}? (e.g., 2025-09-05)",
            response_type="message"
        ), session

    # Step 2: Select date
    if not session.date:
        session.date = text_lower.strip()
        return chatbot_response(
            message=f"⏰ What time on {session.date} would you like the {session.selected_service}? (e.g., 3 PM)",
            response_type="message"
        ), session

    # Step 3: Select time
    if not session.time:
        session.time = text_lower.strip()
        return chatbot_response(
            message=f"✅ Please confirm: Book {session.selected_service} on {session.date} at {session.time}? (yes/no)",
            response_type="message"
        ), session

    # Step 4: Confirm
    if not session.confirmed:
        if "yes" in text_lower:
            session.confirmed = True
            return chatbot_response(
                message=f"🎉 Your {session.selected_service} is booked for {session.date} at {session.time}.",
                response_type="success"
            ), session
        elif "no" in text_lower:
            # Reset booking
            session = ServiceBookingSession()
            return chatbot_response(
                message="❌ Booking cancelled. You can start again by choosing a service.",
                response_type="error"
            ), session
        else:
            return chatbot_response(
                message="❓ Please reply with 'yes' or 'no' to confirm.",
                response_type="message"
            ), session

    # Already confirmed
    return chatbot_response(
        message=f"✅ Your {session.selected_service} booking is already confirmed.",
        response_type="success"
    ), session
