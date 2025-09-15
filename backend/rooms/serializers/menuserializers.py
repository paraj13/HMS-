from rest_framework import serializers
from rooms.models import Meal, Order
import datetime
from backend.constants import MEAL_TYPES, DIET_TYPES, CUISINE_TYPES, SPICE_LEVELS
from backend.utils.save_file import save_file
import os
from django.conf import settings

class MealSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=200)
    category = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_blank=True, required=False)
    currency = serializers.CharField(default="INR")
    price = serializers.FloatField()
    meal_type = serializers.ChoiceField(choices=MEAL_TYPES, default="lunch")
    diet_type = serializers.ChoiceField(choices=DIET_TYPES, default="veg")
    cuisine_type = serializers.ChoiceField(choices=CUISINE_TYPES, default="other")
    spice_level = serializers.ChoiceField(choices=SPICE_LEVELS, default="medium")
    status = serializers.BooleanField(default=True)
    image = serializers.ImageField(required=False)  # ✅ single image
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    is_special = serializers.BooleanField(default=False)
    rating = serializers.FloatField(default=0.0)

    def create(self, validated_data):
            request = self.context.get("request")  # needed for absolute URL
            image_file = validated_data.pop("image", None)

            upload_dir = os.path.join(settings.MEDIA_ROOT, "meals")

            if image_file:
                validated_data["image"] = save_file(image_file, upload_dir, request)

            meal = Meal(**validated_data)
            meal.save()
            return meal

    def update(self, instance: Meal, validated_data):
        request = self.context.get("request")  # needed for absolute URL
        image_file = validated_data.pop("image", None)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle image update
        if image_file:
            upload_dir = os.path.join(settings.MEDIA_ROOT, "meals")
            instance.image = save_file(image_file, upload_dir, request)

        instance.updated_at = datetime.datetime.utcnow()
        instance.save()
        return instance


    def to_representation(self, obj: Meal):
        """
        Convert MongoEngine object to standard JSON response
        """
        return {
            "id": str(obj.id),
            "name": obj.name,
            "category": obj.category,
            "description": obj.description,
            "currency": obj.currency,
            "price": obj.price,
            "meal_type": obj.meal_type,
            "diet_type": obj.diet_type,
            "cuisine_type": obj.cuisine_type,
            "spice_level": obj.spice_level,
            "status": obj.status,
            "image": obj.image,
            "created_at": obj.created_at,
            "updated_at": obj.updated_at,
            "is_special": obj.is_special,
            "rating": obj.rating,
        }

class OrderSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    meal = serializers.CharField()  # ID of the meal
    quantity = serializers.IntegerField()
    notes = serializers.CharField(required=False)
    add_ons = serializers.ListField(child=serializers.CharField(), required=False)
    spice_preference = serializers.CharField(required=False)
    upsell = serializers.CharField(required=False)
    delivery_info = serializers.DictField(required=False)
    payment_method = serializers.CharField(required=False)
    status = serializers.CharField(required=False)

    def create(self, validated_data):
        meal_id = validated_data.pop("meal")
        meal = Meal.objects.get(id=meal_id)
        return Order.objects.create(meal=meal, **validated_data)