# ml/train_intents.py
# Usage: python ml/train_intents.py
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# -----------------------------
# 1) Training dataset
# -----------------------------
INTENTS = {
    # Browse meals / menu
    "list_meals": [
        "show me meals", "list meals", "food menu", "what food do you have",
        "show special meals", "spicy indian meals", "veg dishes", "meals under 200",
        "display the menu", "what can I eat", "show vegetarian options",
    ],

    # Start ordering flow
    "order_food": [
        "order food", "book a meal", "i want to order lunch", "i want to order dinner",
        "can i get pizza", "reserve dinner", "i would like to eat", "place a food order",
        "i want to buy a sandwich", "let's order breakfast",
    ],

    # Greetings
    "greetings": [
        "hi", "hello", "hey there", "good morning", "good evening", "hey bot",
        "hi there", "hello assistant",
    ],

    # Browse rooms
    "list_rooms": [
        "show rooms", "list available rooms", "room types", "rooms under 2000",
        "what rooms are available", "hotel room options", "display room list",
        "do you have deluxe rooms",
    ],

    # Browse services
    "list_services": [
        "show services", "list available services", "what services do you offer",
        "spa services", "laundry service", "list hotel amenities", "what services exist",
        "display services",
    ],

    # NEW: Book a room
    "book_room": [
        "book a room", "reserve a room", "i want to book a room",
        "can you reserve a room for me", "i need a room for tomorrow",
        "book a deluxe room", "i want to make a room booking", "room reservation",
        "please book me a double room", "i need to reserve a suite",
    ],

    # NEW: Book a service (spa, laundry, massage, etc.)
    "book_service": [
        "book a service", "i want to book spa", "schedule a massage",
        "book laundry pickup", "reserve a spa appointment", "book a car service",
        "can you book room cleaning", "service reservation", "i want to book a massage",
        "please schedule laundry service",
    ],
}

# Flatten dataset
train_texts, train_labels = [], []
for intent, examples in INTENTS.items():
    train_texts.extend(examples)
    train_labels.extend([intent] * len(examples))

# -----------------------------
# 2) Build pipeline
# -----------------------------
model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
    ("clf", LogisticRegression(max_iter=1000, solver="lbfgs")),
])

# -----------------------------
# 3) Train/test split & train
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    train_texts, train_labels, test_size=0.2, random_state=42, stratify=train_labels
)
model.fit(X_train, y_train)

# -----------------------------
# 4) Evaluation
# -----------------------------
y_pred = model.predict(X_test)
print("📊 Classification Report:\n")
print(classification_report(y_test, y_pred, digits=3))

# -----------------------------
# 5) Save model
# -----------------------------
os.makedirs("ml", exist_ok=True)
model_path = "ml/intent_model.joblib"
joblib.dump(model, model_path)
print(f"✅ Model trained and saved -> {model_path}")

# -----------------------------
# 6) Quick sanity test
# -----------------------------
def quick_test():
    samples = [
        "can you show me the menu",
        "i want to book a room for tomorrow",
        "hello there",
        "what services do you provide",
        "schedule a massage at the spa",
        "book a deluxe room",
        "order food for lunch",
    ]
    print("\n🔍 Quick Test Predictions:")
    for s in samples:
        print(f"  '{s}' -> {model.predict([s])[0]}")

if __name__ == "__main__":
    quick_test()
