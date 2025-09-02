from rest_framework.views import APIView
from backend.utils.response import success_response, error_response
from ..serializers import (
    UserCreateSerializer, UserUpdateSerializer, UserListSerializer, UserLoginSerializer
)
from ..permissions import RolePermission
from ..authentication import JWTAuthentication
from backend.utils.jwt_helper import generate_access_token, generate_refresh_token
from ..models import User, RefreshToken
import datetime
import random
import string
import jwt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

SECRET_KEY = settings.SECRET_KEY
# -------------------- CREATE --------------------
class CreateUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management']

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return success_response(
                data=user.to_dict(),
                message="User created successfully!",
                status_code=201
            )
        return error_response(message="Validation failed", errors=serializer.errors, status_code=400)


# -------------------- LIST --------------------
class UserListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management']

    def get(self, request):
        # Get role from query params
        role = request.GET.get("role")

        if role:
            users = User.objects(role=role).order_by("-id")

        else:
            users = User.objects.all().order_by("-id")

        
        serializer = UserListSerializer(users, many=True)
        return success_response(data=serializer.data, message="Users fetched successfully")


# -------------------- UPDATE --------------------
class UserUpdateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management']

    def put(self, request, user_id):
        user = User.objects(id=user_id).first()
        if not user:
            return error_response(message="User not found", status_code=404)

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(data=user.to_dict(), message="User updated successfully")
        return error_response(message="Validation failed", errors=serializer.errors, status_code=400)


# -------------------- DELETE --------------------
class UserDeleteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management']

    def delete(self, request, user_id):
        user = User.objects(id=user_id).first()
        if not user:
            return error_response(message="User not found", status_code=404)

        user.delete()
        return success_response(message="User deleted successfully")

# -------------------- DETAIL --------------------
class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management']

    def get(self, request, user_id):
        user = User.objects(id=user_id).first()
        if not user:
            return error_response(message="User not found", status_code=404)
        
        serializer = UserListSerializer(user)
        return success_response(data=serializer.data, message="User fetched successfully")


# -------------------- LOGIN --------------------
class LoginUserView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            access_token = generate_access_token(user)
            refresh_token = generate_refresh_token(user)

            # save refresh token in DB
            expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=7)
            RefreshToken(user_id=str(user.id), token=refresh_token, expires_at=expires_at).save()

            return success_response(
                data={
                    "user": user.to_dict(),
                    "access_token": access_token,
                    "refresh_token": refresh_token
                },
                message="Login successful"
            )

        return error_response(
            message="Validation failed",
            errors=serializer.errors,
            status_code=400
        )


# -------------------- LOGOUT --------------------
# class LogoutUserView(APIView):
    
#     def post(self, request):
#         refresh_token = request.data.get("refresh_token")
#         if not refresh_token:
#             return error_response(message="Refresh token required", status_code=400)

#         token_entry = RefreshToken.objects(token=refresh_token).first()
#         if not token_entry:
#             return error_response(message="Invalid refresh token", status_code=400)

#         token_entry.delete()
#         return success_response(message="Logout successful, refresh token revoked")

class LogoutUserView(APIView):
    """
    Logout user by revoking the refresh token.
    """
    def post(self, request):
        refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify if token is valid
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return Response(
                {"success": False, "message": "Refresh token expired"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except jwt.InvalidTokenError:
            return Response(
                {"success": False, "message": "Invalid refresh token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Delete refresh token from DB
        token_entry = RefreshToken.objects.filter(token=refresh_token).first()
        if token_entry:
            token_entry.delete()

        return Response(
            {"success": True, "message": "Logout successful"},
            status=status.HTTP_200_OK
        )

class DashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    # permission_classes = [RolePermission]
    allowed_roles = ['management']

    def get(self, request):
        # Count total users
        total_users = User.objects.count()

        # Count users by role
        total_management = User.objects(role="management").count()
        total_hotel_staff = User.objects(role="hotel-staff").count()
        total_guest = User.objects(role="guest").count()

        data = {
            "total_users": total_users,
            "role_counts": {
                "management": total_management,
                "hotel_staff": total_hotel_staff,
                "guest": total_guest
            }
        }

        return success_response(message="Dashboard data fetched successfully", data=data)
