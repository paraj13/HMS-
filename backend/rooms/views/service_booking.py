# backend/services/views/service_booking.py

from rest_framework.views import APIView
from rest_framework import status
from accounts.authentication import JWTAuthentication
from accounts.permissions import RolePermission
from backend.utils.response import success_response, error_response
from ..models import Service
from ..models import ServiceBooking
from ..serializers.bookingserializer import ServiceBookingSerializer
from backend.utils.pagination import paginate_queryset  # import the helper function


class ServiceBookingView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management', 'staff', 'guest']

    def post(self, request, service_id):
        """
        Book a service using MongoEngine
        """
        # Check if service exists
        service = Service.objects(id=service_id).first()
        if not service:
            return error_response(message="Service not found", status_code=status.HTTP_404_NOT_FOUND)

        data = {
            'user': str(request.user.id),   # ✅ change to 'user'
            'service': str(service.id),
            'date': request.data.get('date', ''),
            'time': request.data.get('time', ''),
            'notes': request.data.get('notes', '')
        }

        serializer = ServiceBookingSerializer(data=data)
        if serializer.is_valid():
            booking = serializer.save()
            return success_response(
                data=ServiceBookingSerializer(booking).data,
                message="Service booked successfully",
                status_code=status.HTTP_201_CREATED
            )

        return error_response(message="Validation failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class BookingListView(APIView):
    """
    API to fetch bookings
    - Guest → only their bookings
    - Admin/Staff → all bookings
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management', 'staff', 'guest']

    def get(self, request):
        user = request.user

        if getattr(user, "is_staff", False) or getattr(user, "role", "") in ["management", "hotel-staff"]:
            bookings = ServiceBooking.objects.all().order_by("-id")

        else:
            bookings = ServiceBooking.objects.filter(user=str(user.id)).order_by("-id")


        serializer = ServiceBookingSerializer(bookings, many=True)
        return success_response(
            data=serializer.data,
            message="Bookings retrieved successfully"
        )
        
class BookingStatusUpdateView(APIView):
    """
    API for admin/staff to accept or reject a booking
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management', 'staff']  # only admin/staff

    def post(self, request, booking_id):
        status_choice = request.data.get("status")

        if status_choice not in ["accepted", "rejected"]:
            return error_response(
                message="Invalid status. Allowed: accepted / rejected",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        booking = ServiceBooking.objects(id=booking_id).first()
        if not booking:
            return error_response(
                message="Booking not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        booking.status = status_choice
        booking.save()

        return success_response(
            data=ServiceBookingSerializer(booking).data,
            message=f"Booking {status_choice} successfully"
        )
