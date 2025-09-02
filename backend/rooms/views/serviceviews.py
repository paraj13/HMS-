from rest_framework.views import APIView
from accounts.permissions import RolePermission
from accounts.authentication import JWTAuthentication
from rest_framework import status
from ..models import Service
from ..serializers.serviceserializer import ServiceSerializer
from backend.utils.response import success_response, error_response   # <-- import your helpers


class ServiceListCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management', 'staff', 'guest']

    def get(self, request):
        services = Service.objects()
        serializer = ServiceSerializer(services, many=True)
        return success_response(data=serializer.data, message="Services fetched successfully")

    def post(self, request):
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            service = serializer.save()
            return success_response(
                data=ServiceSerializer(service).data,
                message="Service created successfully",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(message="Validation failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


class ServiceDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ['management']

    def get_object(self, pk):
        try:
            return Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return None

    def get(self, request, pk):
        service = self.get_object(pk)
        if not service:
            return error_response(message="Service not found", status_code=status.HTTP_404_NOT_FOUND)
        serializer = ServiceSerializer(service)
        return success_response(data=serializer.data, message="Service details fetched successfully")

    def put(self, request, pk):
        service = self.get_object(pk)
        if not service:
            return error_response(message="Service not found", status_code=status.HTTP_404_NOT_FOUND)
        serializer = ServiceSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            service = serializer.save()
            return success_response(data=ServiceSerializer(service).data, message="Service updated successfully")
        return error_response(message="Validation failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        service = self.get_object(pk)
        if not service:
            return error_response(message="Service not found", status_code=status.HTTP_404_NOT_FOUND)
        service.delete()
        return success_response(message="Service deleted successfully", status_code=status.HTTP_204_NO_CONTENT)
