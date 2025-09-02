import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import User
from django.conf import settings


SECRET_KEY = settings.SECRET_KEY

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None  # no auth provided

        try:
            prefix, token = auth_header.split(" ")
            if prefix.lower() != "bearer":
                raise exceptions.AuthenticationFailed("Invalid token prefix")

            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            if not user_id:
                raise exceptions.AuthenticationFailed("Token missing user id")

            user = User.objects(id=user_id).first()
            if not user:
                raise exceptions.AuthenticationFailed("User not found")

            return (user, token)
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")
