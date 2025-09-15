from mongoengine import Document, StringField, FloatField, IntField, ListField, DateTimeField, BooleanField, ReferenceField, DictField
import datetime
from backend.constants import STATUS_VALUES, ROOM_TYPES, MEAL_TYPES, DIET_TYPES, CUISINE_TYPES, SPICE_LEVELS

class Room(Document):
    number = IntField(required=True, unique=True)
    type = StringField(required=True,choices=ROOM_TYPES)
    status = StringField(required=True, choices=STATUS_VALUES, default='available')
    price = FloatField(required=True)
    cover_image = StringField(required=False)          
    other_images = ListField(StringField(), default=[])

    def to_dict(self):
        return {
            'id': str(self.id),
            'number': self.number,
            'type': self.type,
            'status': self.status,
            'price': self.price,
            "cover_image": self.cover_image,
            "other_images": self.other_images,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }


class Service(Document):
    name = StringField(required=True, unique=True)
    category = StringField(required=True)
    description = StringField()
    price = FloatField(required=True)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(Service, self).save(*args, **kwargs)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "price": self.price,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
        
class ServiceBooking(Document):
    meta = {'collection': 'service_bookings'}
    user = ReferenceField('User', required=True)  # direct reference to User
    service = ReferenceField(Service, required=True)
    booking_date = DateTimeField(default=datetime.datetime.utcnow)
    date = StringField()
    time = StringField()
    notes = StringField()  # optional
    status = StringField(default="pending")

    def __str__(self):
        return f"Booking {self.id} - User: {self.user.id} Service: {self.service.name}"
    
class Meal(Document):
    name = StringField(required=True, max_length=200)
    category = StringField(required=True, max_length=200)
    description = StringField()
    currency = StringField(default="INR")
    price = FloatField(required=True)
    meal_type = StringField(choices=MEAL_TYPES, default="lunch")
    diet_type = StringField(choices=DIET_TYPES, default="veg")
    cuisine_type = StringField(choices=CUISINE_TYPES, default="other")
    spice_level = StringField(choices=SPICE_LEVELS, default="medium")
    status = BooleanField(default=True)  # available / not available
    image = StringField()  # store image URL or path
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)
    is_special = BooleanField(default=False)
    rating = FloatField(default=0.0)
    meta = {
        "collection": "meals"
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(Meal, self).save(*args, **kwargs)
    
class Order(Document):
    meal = ReferenceField(Meal, required=True)
    quantity = IntField(default=1)
    add_ons = ListField(StringField())
    spice_preference = StringField()
    upsell = StringField()
    delivery_info = DictField()  # {"room": "101", "last_name": "Patel"}
    note = StringField()
    payment_method = StringField()
    status = StringField(default="pending")  # pending / preparing / delivered
