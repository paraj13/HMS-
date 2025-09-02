# serializers.py
from rest_framework import serializers
from ..models import Room
import os
from django.conf import settings
from backend.utils.save_file import save_file


class RoomCreateSerializer(serializers.Serializer):
    number = serializers.IntegerField()
    type = serializers.ChoiceField(choices=['single', 'double', 'suite'])
    status = serializers.ChoiceField(choices=['available', 'booked', 'maintenance'])
    price = serializers.FloatField()
    cover_image = serializers.ImageField(required=False)
    other_images = serializers.ListField(
        child=serializers.ImageField(), required=False
    )

    def validate_number(self, value):
        if Room.objects(number=value).first():
            raise serializers.ValidationError("Room number already exists.")
        return value

    def create(self, validated_data):
        request = self.context.get("request")  # get request for absolute URL
        cover_image = validated_data.pop('cover_image', None)
        other_images_files = validated_data.pop('other_images', [])

        upload_dir = os.path.join(settings.MEDIA_ROOT, "rooms")

        if cover_image:
            validated_data['cover_image'] = save_file(cover_image, upload_dir, request)

        validated_data['other_images'] = [
            save_file(img, upload_dir, request) for img in other_images_files
        ]

        room = Room(**validated_data)
        room.save()
        return room



class RoomUpdateSerializer(serializers.Serializer):
    type = serializers.CharField(required=False)
    status = serializers.ChoiceField(choices=['available', 'booked', 'maintenance'], required=False)
    price = serializers.FloatField(required=False)
    cover_image = serializers.ImageField(required=False)
    other_images = serializers.ListField(child=serializers.ImageField(), required=False)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        cover_image = validated_data.pop('cover_image', None)
        other_images_files = validated_data.pop('other_images', [])

        upload_dir = os.path.join(settings.MEDIA_ROOT, "rooms")

        if cover_image:
            instance.cover_image = save_file(cover_image, upload_dir, request)

        if other_images_files:
            instance.other_images = [save_file(img, upload_dir, request) for img in other_images_files]

        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.save()
        return instance



class RoomListSerializer(serializers.Serializer):
    id = serializers.CharField()
    number = serializers.CharField()
    type = serializers.CharField()
    status = serializers.CharField()
    price = serializers.FloatField()
    cover_image = serializers.SerializerMethodField()
    other_images = serializers.SerializerMethodField()

    def get_cover_image(self, obj):
        if obj.cover_image:
            return f"{obj.cover_image}"
        return None

    def get_other_images(self, obj):
        if obj.other_images:
            return [f"{img}" for img in obj.other_images]
        return []
