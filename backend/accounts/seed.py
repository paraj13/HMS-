# backend/accounts/seed.py
# python -m accounts.seed   
import os
import django

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()  # initialize Django

from django.contrib.auth.hashers import make_password
from accounts.models import User
import mongo  # MongoDB connection

# Check if superadmin exists
if not User.objects(role="management", username="superadmin").first():
    superadmin = User(
        username="superadmin",
        email="admin@gmail.com",
        mobile_no="9999999999",
        city="AdminCity",
        role="management"
    )
    superadmin.password = make_password("admin@123")
    superadmin.save()
    print("Superadmin created successfully!")
else:
    print("Superadmin already exists!")
