from chatbot.utils.response_helpers import chatbot_response


class RoomBookingSession:
    def __init__(self):
        self.room_type = None
        self.check_in = None
        self.check_out = None
        self.confirmed = False


def book_room(session: RoomBookingSession, text_lower: str):
    """
    Handles multi-step booking flow for rooms.
    """
    # Step 1: Select room type
    if not session.room_type:
        session.room_type = text_lower.strip()
        return chatbot_response(
            message=f"📅 Great choice! When would you like to check in for your {session.room_type} room? (e.g., 2025-09-05)",
            response_type="message"
        ), session

    # Step 2: Select check-in date
    if not session.check_in:
        session.check_in = text_lower.strip()
        return chatbot_response(
            message=f"📆 And when would you like to check out? (e.g., 2025-09-07)",
            response_type="message"
        ), session

    # Step 3: Select check-out date
    if not session.check_out:
        session.check_out = text_lower.strip()
        return chatbot_response(
            message=f"✅ Please confirm: Book a {session.room_type} room from {session.check_in} to {session.check_out}? (yes/no)",
            response_type="message"
        ), session

    # Step 4: Confirm
    if not session.confirmed:
        if "yes" in text_lower:
            session.confirmed = True
            return chatbot_response(
                message=f"🎉 Your {session.room_type} room is booked from {session.check_in} to {session.check_out}.",
                response_type="success"
            ), session
        elif "no" in text_lower:
            # Reset booking
            session = RoomBookingSession()
            return chatbot_response(
                message="❌ Room booking cancelled. You can start again by selecting a room type.",
                response_type="error"
            ), session
        else:
            return chatbot_response(
                message="❓ Please reply with 'yes' or 'no' to confirm.",
                response_type="message"
            ), session

    # Already confirmed
    return chatbot_response(
        message=f"✅ Your {session.room_type} room booking is already confirmed.",
        response_type="success"
    ), session
