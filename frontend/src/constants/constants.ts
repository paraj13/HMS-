// Room types
export const ROOM_TYPES = [
"single",
"double",
"suite",
"deluxe",
"family",
"presidential",
"studio",
"executive"
];

// Room statuses
export const ROOM_STATUSES = ["available", "booked", "maintenance", "under renovation"];

// Service categories
export const SERVICE_CATEGORIES = [
"cleaning",
"food",
"spa",
"laundry",
"room service",
"massage",
"gym",
"airport transfer",
"concierge",
"tour guide",
"valet parking",
"laundry express",
"mini bar"
];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack","dessert"]
export const DIET_TYPES = ["veg", "non-veg", "vegan"]
export const CUISINE_TYPES = ["indian", "chinese", "italian", "mexican", "other"]
export const SPICE_LEVELS = ["mild", "medium", "spicy"]
export const MEAL_CATEGORIES = [
  "Pizza",
  "Sandwich",
  "Burger",
  "Pasta",
  "Salad",
  "Soup",
  "Rice",
  "Noodles",
  "Rolls",
  "Fries",
  "Tacos",
  "Curry",
  "Biryani",
  "Ice Cream",
  "Cake",
  "Juice",
  "Coffee",
  "Tea",
];
// constants.js

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)" },
];

export const badgeColors: Record<string, string> = {
  category: "bg-purple-100 text-purple-800",
  meal_type: "bg-blue-100 text-blue-800",
  diet_type: "bg-green-100 text-green-800",
  cuisine_type: "bg-yellow-100 text-yellow-800",
  spice_level: "bg-red-100 text-red-800",
  is_special: "bg-pink-100 text-pink-800",
};


// constants.ts
export const INITIAL_OPTIONS = [
  "Show menu",
  "Order food",
  "Track order",
  "Help",
];
