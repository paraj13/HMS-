import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Meal {
  id?: string;
  name: string;
  category: string;
  description?: string;
  currency: string;
  price: number;
  meal_type: string;
  diet_type: string;
  cuisine_type: string;
  spice_level: string;
  status?: boolean;
  image?: string | File; // allow both file + string
  is_special?: boolean;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

// --- Fetch all meals ---
export const fetchMeals = async (): Promise<Meal[]> => {
  const res = await axios.get(`${API_BASE_URL}/meals/`,{
    headers: { "Content-Type": "multipart/form-data"},

  });
  return res.data.data; // assuming your API response is { data, message }
};

// --- Get single meal ---
export const getMeal = async (mealId: string): Promise<Meal> => {
  const res = await axios.get(`${API_BASE_URL}/meals/${mealId}/`,{
    headers: { "Content-Type": "multipart/form-data" },

  });
  return res.data.data;
};

// --- Create new meal ---
export const createMeal = async (meal: Meal): Promise<Meal> => {
  const res = await axios.post(`${API_BASE_URL}/meals/create/`, meal, {
    headers: { "Content-Type": "multipart/form-data" , "Authorization": `Bearer ${localStorage.getItem("token")}` },

  });
  return res.data.data;
};

// --- Update meal ---
export const updateMeal = async (mealId: string, meal: Partial<Meal>): Promise<Meal> => {

   const formData = new FormData();

  Object.entries(meal).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image") {
      if (value instanceof File) {
        formData.append("image", value); // ✅ Only send if File
      }
    } else {
      formData.append(key, value as any);
    }
  });

  const res = await axios.put(`${API_BASE_URL}/meals/${mealId}/update/`, formData, {
    headers: { "Content-Type": "multipart/form-data" , "Authorization": `Bearer ${localStorage.getItem("token")}` },

  });
  return res.data.data;
};

// --- Delete meal ---
export const deleteMeal = async (mealId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/meals/${mealId}/delete/`, {
    headers: { "Content-Type": "multipart/form-data" , "Authorization": `Bearer ${localStorage.getItem("token")}` },

  });
};
