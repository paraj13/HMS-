from typing import List, Optional, Dict

def chatbot_response(
    message: str,
    suggestions: Optional[List[str]] = None,
    response_type: str = "message"
) -> Dict:
    """
    Returns a simple structured chatbot response.

    :param user_message: Original user message or text to show
    :param suggestions: Optional list of suggestions
    :param response_type: Type of message (default "message", can be "error", "suggestion", etc.)
    :return: Dict with type, message, and suggestions
    """
    return {
        "type": response_type,
        "message": message,
        "suggestions": suggestions or []
    }
