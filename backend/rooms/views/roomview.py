# backend/rooms/views.py
from rest_framework.views import APIView
from accounts.authentication import JWTAuthentication
from accounts.permissions import RolePermission
from backend.utils.response import success_response, error_response
from ..models import Room
from ..serializers.roomserializers import (
    RoomCreateSerializer,
    RoomUpdateSerializer,
    RoomListSerializer,
)

# ---------------------- LIST ----------------------
class RoomListView(APIView):
    def get(self, request):
        rooms = Room.objects.all().order_by("-id")
        serializer = RoomListSerializer()
        data = [serializer.to_representation(r) for r in rooms]
        return success_response(data, "Rooms fetched successfully")


# ---------------------- CREATE ----------------------
class RoomCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff"]

    def post(self, request):
        if request.user.role not in self.allowed_roles:
            return error_response("Permission denied", 403)

        serializer = RoomCreateSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            room = serializer.save()
            return success_response(
                RoomListSerializer().to_representation(room),
                "Room created successfully",
                201
            )
        return error_response("Validation error", serializer.errors)


# ---------------------- DETAIL ----------------------
class RoomDetailView(APIView):
    def get_object(self, room_id):
        
        return Room.objects(id=room_id).first()

    def get(self, request, room_id):
        room = self.get_object(room_id)
        print(room)
        if not room:
            return error_response("Room not found", 404)

        serializer = RoomListSerializer()
        return success_response(serializer.to_representation(room), "Room details fetched successfully")


# ---------------------- UPDATE ----------------------
class RoomUpdateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff"]

    def get_object(self, room_id):
        return Room.objects(id=room_id).first()

    def put(self, request, room_id):
        if request.user.role not in self.allowed_roles:
            return error_response("Permission denied", 403)

        room = self.get_object(room_id)
        if not room:
            return error_response("Room not found", 404)

        serializer = RoomUpdateSerializer(room, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            updated_room = serializer.save()
            return success_response(RoomListSerializer().to_representation(updated_room), "Room updated successfully")
        return error_response("Validation error", serializer.errors)


# ---------------------- DELETE ----------------------
class RoomDeleteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff"]

    def get_object(self, room_id):
        return Room.objects(id=room_id).first()

    def delete(self, request, room_id):
        if request.user.role not in self.allowed_roles:
            return error_response("Permission denied", 403)

        room = self.get_object(room_id)
        if not room:
            return error_response("Room not found", 404)

        room.delete()
        return success_response(message="Room deleted successfully", status_code=204)
