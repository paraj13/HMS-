# backend/services/serializers/bookingserializer.py

from rest_framework import serializers
from ..models import ServiceBooking
from ..models import Service

class ServiceBookingSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)   # <-- add this
    user = serializers.CharField()
    service = serializers.CharField()
    booking_date = serializers.DateTimeField(required=False)
    date = serializers.CharField(required=True)
    time = serializers.CharField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(default="pending")

    def create(self, validated_data):
        # Convert service id to actual Service object
        service_obj = Service.objects(id=validated_data['service']).first()
        if not service_obj:
            raise serializers.ValidationError("Service not found")
        validated_data['service'] = service_obj
        return ServiceBooking(**validated_data).save()

    def to_representation(self, obj):
        return {
            "id": str(obj.id),   # return booking id
            "service_name": obj.service.name if obj.service else None,
            "user_name": str(obj.user.username) if hasattr(obj.user, "username") else None,
            "date": obj.date,
            "time": obj.time,
            "notes": obj.notes,
            "status": obj.status,
        }
