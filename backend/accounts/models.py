from mongoengine import Document, StringField, EmailField, DateTimeField
from django.contrib.auth.hashers import make_password, check_password
import datetime


class User(Document):
    username = StringField(required=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    mobile_no = StringField(required=True)
    city = StringField()
    role = StringField(choices=('management', 'hotel-staff', 'guest'), default='guest')
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.save()

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def to_dict(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "mobile_no": self.mobile_no,
            "city": self.city,
            "role": self.role
        }


class RefreshToken(Document):
    user_id = StringField(required=True)
    token = StringField(required=True, unique=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    expires_at = DateTimeField(required=True)

