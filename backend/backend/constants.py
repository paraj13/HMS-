# Room statuses
STATUS_VALUES = [
"available",
"booked",
"maintenance",
"under_renovation", # optional new status
]


LIST_KEYWORDS = [
"list", "show", "available", "get", "display", "all", "view", "what services", "which","room", "service"
]
ROOM_KEYWORDS = ["room", "rooms", "suite", "stay"]


# meal keywords
MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "dessert",  "beverage", ]
DIET_TYPES = ["veg", "non-veg", "vegan"]
CUISINE_TYPES = ["indian", "chinese", "italian", "mexican", "other"]
SPICE_LEVELS = ["mild", "medium", "spicy"]
MEAL_CATEGORIES = [ "pizza",
"sandwich",
"burger",
"pasta",
"salad",
"soup",
"rice",
"noodles",
"rolls",
"fries",
"tacos",
"curry",
"biryani",
"ice cream",
"cake",
"juice",
"coffee",
"tea",]
MEAL_KEYWORDS = ["meal", "menu", "food", "dish"] + MEAL_TYPES + DIET_TYPES + CUISINE_TYPES + SPICE_LEVELS+MEAL_CATEGORIES

ROOM_TYPES = [
"single",
"double",
"suite",
"deluxe",
"family",
"presidential",
"studio",
"executive",
]
SERVICE_CATEGORIES = [
"cleaning",
"food",
"spa",
"laundry",
"room_service",
"massage",
"gym",
"airport_transfer",
"concierge",
"tour_guide",
"valet_parking",
"laundry_express",
"mini_bar",
]

# ----------------- Category-wise Add-ons -----------------
CATEGORY_ADD_ONS = {
    "pizza": [
        {"name": "extra cheese", "price": 50},
        {"name": "extra sauce", "price": 30},
        {"name": "garlic bread", "price": 80},
    ],
    "burger": [
        {"name": "extra cheese", "price": 50},
        {"name": "fries", "price": 70},
        {"name": "hash browns", "price": 60},
    ],
    "sandwich": [
        {"name": "extra cheese", "price": 40},
        {"name": "extra sauce", "price": 30},
        {"name": "chips", "price": 50},
    ],
    "pasta": [
        {"name": "extra sauce", "price": 30},
        {"name": "garlic bread", "price": 80},
    ],
    "salad": [
        {"name": "extra dressing", "price": 20},
        {"name": "breadsticks", "price": 60},
    ],
    "soup": [
        {"name": "bread", "price": 30},
        {"name": "croutons", "price": 40},
    ],
    "rice": [
        {"name": "extra curry", "price": 60},
        {"name": "papad", "price": 20},
    ],
    "noodles": [
        {"name": "extra sauce", "price": 30},
        {"name": "spring roll", "price": 90},
    ],
    "rolls": [
        {"name": "extra sauce", "price": 30},
        {"name": "fries", "price": 70},
    ],
    "fries": [
        {"name": "extra cheese", "price": 40},
        {"name": "peri-peri seasoning", "price": 30},
    ],
    "tacos": [
        {"name": "extra cheese", "price": 50},
        {"name": "guacamole", "price": 90},
    ],
    "curry": [
        {"name": "extra rice", "price": 50},
        {"name": "naan", "price": 40},
    ],
    "biryani": [
        {"name": "raita", "price": 40},
        {"name": "salad", "price": 30},
    ],
    "ice cream": [
        {"name": "chocolate syrup", "price": 20},
        {"name": "sprinkles", "price": 20},
    ],
    "cake": [
        {"name": "extra cream", "price": 30},
        {"name": "chocolate syrup", "price": 20},
    ],
}

# ----------------- Upsells (Meal type-wise, with price) -----------------
TYPE_UPSELLS = {
    "breakfast": [
        {"name": "coffee", "price": 40},
        {"name": "tea", "price": 30},
        {"name": "juice", "price": 50},
        {"name": "milkshake", "price": 80},
    ],
    "lunch": [
        {"name": "soft drink", "price": 40},
        {"name": "juice", "price": 50},
        {"name": "coffee", "price": 40},
    ],
    "dinner": [
        {"name": "soft drink", "price": 40},
        {"name": "juice", "price": 50},
        {"name": "milkshake", "price": 80},
    ],
    "snack": [
        {"name": "coffee", "price": 40},
        {"name": "tea", "price": 30},
        {"name": "soft drink", "price": 40},
    ],
    "dessert": [
        {"name": "ice cream", "price": 60},
        {"name": "cake", "price": 80},
    ],
    "drink": [
        {"name": "soft drink", "price": 40},
        {"name": "juice", "price": 50},
    ],
}


# ------------------- Greeting Options -------------------
GREETING_OPTIONS = [
{"label": "Order Food 🍽️", "value": "order food"},
{"label": "Show Menu 📖", "value": "show menu"},
{"label": "Check Available Rooms 🏨", "value": "available rooms"},
{"label": "View Available Services 🛎️", "value": "available services"},
{"label": "Reserve a Service 💆", "value": "reserve service"},
{"label": "Book a Room 🛏️", "value": "book room"},
]
