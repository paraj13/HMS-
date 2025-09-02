import jwt, datetime
from django.conf import settings

SECRET_KEY = settings.SECRET_KEY

def generate_access_token(user):
    payload = {
        "user_id": str(user.id),
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60)  # short expiry
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def generate_refresh_token(user):
    payload = {
        "user_id": str(user.id),
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)  # long expiry
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
