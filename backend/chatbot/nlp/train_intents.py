# ml/train_intents.py
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
import os

# --- Tiny seed dataset (expand this! 30–100 examples/intent is nice) ---
train_texts = [
    # list_meals
    "show me meals", "list meals", "food menu", "what food do you have",
    "show special meals", "spicy indian meals", "veg dishes", "meals under 200",
    # list_rooms
    "show rooms", "list available rooms", "rooms under 2000", "room types",
    # list_services
    "show spa services", "list services", "available laundry service",
    # book_meal
    "book a meal", "reserve dinner", "i want to order lunch",
    # book_room
    "book a room", "reserve a room for tomorrow",
    # book_service
    "book a spa", "i want to reserve massage",
    # greetings
    "hi", "hello", "hey there", "good morning",
    # help
    "help", "what can you do", "how does this work",
]

train_labels = [
    # list_meals (8)
    "list_meals","list_meals","list_meals","list_meals",
    "list_meals","list_meals","list_meals","list_meals",
    # list_rooms (4)
    "list_rooms","list_rooms","list_rooms","list_rooms",
    # list_services (3)
    "list_services","list_services","list_services",
    # book_meal (3)
    "book_meal","book_meal","book_meal",
    # book_room (2)
    "book_room","book_room",
    # book_service (2)
    "book_service","book_service",
    # greetings (4)
    "greetings","greetings","greetings","greetings",
    # help (3)
    "help","help","help",
]

# pipeline: TF-IDF + LogisticRegression
model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1,2), min_df=1)),
    ("clf", LogisticRegression(max_iter=1000))
])

model.fit(train_texts, train_labels)
os.makedirs("ml", exist_ok=True)

# Save
joblib.dump(model, "ml/intent_model.joblib")
print("Saved -> ml/intent_model.joblib")
    