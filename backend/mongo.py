# backend/mongo.py
import os
from mongoengine import connect
from dotenv import load_dotenv

load_dotenv()  # load environment variables from .env

MONGO_NAME = os.getenv("MONGO_NAME")
MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST", "127.0.0.1")
MONGO_PORT = int(os.getenv("MONGO_PORT", 27017))

if MONGO_USER and MONGO_PASSWORD:
    connect(
        db=MONGO_NAME,
        host=MONGO_HOST,
        port=MONGO_PORT,
        username=MONGO_USER,
        password=MONGO_PASSWORD
    )
else:
    connect(
        db=MONGO_NAME,
        host=MONGO_HOST,
        port=MONGO_PORT
    )
