from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password
import random
import string


# -------------------- LOGIN --------------------
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        print(email, password)
        user = User.objects(email=email).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError({
                "non_field_errors": ["Invalid credentials."]
            })

        # Attach the user object to validated data
        attrs['user'] = user
        return attrs

# -------------------- CREATE --------------------
class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    mobile_no = serializers.CharField(required=True)
    city = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=('management', 'hotel-staff', 'guest'), default='guest')

    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError("Email already exists.")
        return value

    # def generate_random_password(self, length=10):
    #     chars = string.ascii_letters + string.digits + string.punctuation
    #     return ''.join(random.choice(chars) for _ in range(length))
    def generate_random_password(self, length=10):
    # Temporary static password for testing
        return "admin@123"

    def create(self, validated_data):
        # Generate random password
        raw_password = self.generate_random_password()

        # Hash password before saving
        validated_data['password'] = make_password(raw_password)

        user = User(**validated_data)
        user.save()

        # Optionally return raw password so you can send it to user via email/SMS
        user.raw_password = raw_password
        return user

# -------------------- UPDATE --------------------
class UserUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    mobile_no = serializers.CharField(required=False)
    city = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=('management', 'staff', 'guest'), required=False)

    # ❌ Removed email & password from update
    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance

# -------------------- LIST --------------------
class UserListSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    username = serializers.CharField()
    email = serializers.EmailField()
    mobile_no = serializers.CharField()
    city = serializers.CharField()
    role = serializers.CharField()

    def to_representation(self, instance):
        return instance.to_dict()
