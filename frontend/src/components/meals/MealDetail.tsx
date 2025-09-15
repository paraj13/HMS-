"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getMeal } from "@/services/mealService";
import { badgeColors } from "@/constants/constants";


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
  image?: string | File | undefined;
  is_special?: boolean;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  mealId: string;
}

export default function MealDetail({ mealId }: Props) {
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const data = await getMeal(mealId);
        setMeal(data);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Failed to fetch meal details");
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [mealId]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (!meal) return <p className="text-center mt-10 text-red-500">Meal not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image Section */}
        {meal.image && typeof meal.image === "string" && (
          <div className="flex-shrink-0 w-full lg:w-1/3">
            <img
              src={meal.image}
              alt={meal.name}
              className="w-full h-full object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Details Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{meal.name}</h1>
            <p className="text-gray-600 mb-6">{meal.description}</p>

            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColors.category}`}>
                {meal.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColors.meal_type}`}>
                {meal.meal_type}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColors.diet_type}`}>
                {meal.diet_type}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColors.cuisine_type}`}>
                {meal.cuisine_type}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColors.spice_level}`}>
                {meal.spice_level}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColors.is_special}`}>
                {meal.is_special ? "Special" : "Regular"}
              </span>
            </div>

            <div className="mt-6 text-lg font-semibold text-blue-600">
              Price: {meal.currency} {meal.price}
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="self-start mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
