from rest_framework import serializers
from ..models import Service

class ServiceSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(required=True, max_length=100)
    category = serializers.CharField(required=True, max_length=100)
    description = serializers.CharField(allow_blank=True, required=False)
    price = serializers.FloatField(required=True)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate_name(self, value):
        """Ensure service name is unique, excluding self on update."""
        service_id = self.instance.id if self.instance else None
        existing = Service.objects(name=value).first()

        if existing and str(existing.id) != str(service_id):
            raise serializers.ValidationError("Service with this name already exists.")
        return value

    def create(self, validated_data):
        service = Service(**validated_data)
        service.save()
        return service

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.category = validated_data.get("category", instance.category)
        instance.description = validated_data.get("description", instance.description)
        instance.price = validated_data.get("price", instance.price)
        instance.is_active = validated_data.get("is_active", instance.is_active)
        instance.save()
        return instance
