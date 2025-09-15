from typing import List, Optional, Dict

def chatbot_response(
    message: str,
    suggestions: Optional[List[str]] = None,
    options: Optional[List[Dict[str, str]]] = None,
    response_type: str = "message"
) -> Dict:
    """
    Returns a structured chatbot response with support for suggestions and clickable options.

    :param message: Message to show to the user
    :param suggestions: Optional list of text suggestions (quick reply hints)
    :param options: Optional list of clickable options (each with 'label' and 'value' or 'link')
    :param response_type: Type of message (default "message", can be "error", "suggestion", etc.)
    :return: Dict with type, message, suggestions, and options
    """
    return {
        "type": response_type,
        "message": message,
        "suggestions": suggestions or [],
        "options": options or []
    }
