"use client";

import React, { useEffect, useState } from "react";
import { fetchMeals as fetchMealsAPI, deleteMeal, Meal } from "@/services/mealService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";
import { getRole } from "@/utils/auth";
import { badgeColors } from "@/constants/constants";
 

export default function MealList() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("guest");

  // Handle File | string for image
  const getImageSrc = (image: string | File | undefined) => {
    if (!image) return "/images/img-not-found.png";
    if (typeof image === "string") return image;
    return URL.createObjectURL(image);
  };

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const data = await fetchMealsAPI();
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch meals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRole(getRole());
    fetchMeals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure to delete this meal?")) return;
    try {
      setDeletingId(id);
      await deleteMeal(id);
      toast.success("Meal deleted successfully!");
      fetchMeals();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete meal");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading meals...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Meals</h1>
        {role !== "guest" && (
          <button
            onClick={() => router.push("/meals/create")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
          >
            Add Meal
          </button>
        )}
      </div>

      {/* Meals Grid */}
      {!Array.isArray(meals) || meals.length === 0 ? (
        <p className="text-center text-gray-500">No meals found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white shadow-md rounded-xl overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/meals/detail/${meal.id}`)} // Navigate to detail page
            >
              {/* Meal Image */}
              <div className="w-full h-40 overflow-hidden">
                <img
                  src={getImageSrc(meal.image)}
                  alt={meal.name}
                  className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Meal Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{meal.name}</h2>
                  <p className="text-gray-600 text-sm line-clamp-2">{meal.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded ${badgeColors.meal_type}`}>{meal.meal_type}</span>
                    <span className={`px-2 py-1 rounded ${badgeColors.diet_type}`}>{meal.diet_type}</span>
                    <span className={`px-2 py-1 rounded ${badgeColors.cuisine_type}`}>{meal.cuisine_type}</span>
                    <span className={`px-2 py-1 rounded ${badgeColors.spice_level}`}>🔥 {meal.spice_level}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Star
                      size={16}
                      className={`mr-1 ${meal.is_special ? "text-yellow-500" : "text-gray-300"}`}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-md font-bold text-blue-600">{meal.currency} {meal.price}</span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      meal.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {meal.status ? "Available" : "Unavailable"}
                  </span>
                </div>

                {role !== "guest" && (
                  <div className="flex mt-3 space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        router.push(`/meals/update/${meal.id}`);
                      }}
                      className="px-2 py-1 text-black rounded hover:bg-yellow-500 hover:text-white"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        handleDelete(meal.id!);
                      }}
                      disabled={deletingId === meal.id}
                      className="px-2 py-1 text-black rounded hover:bg-red-600 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
