"use client";

import MealForm from "@/components/meals/MealForm";

import { use } from "react";

export default function UpdateMealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <MealForm mode="edit" mealId={id} />;
}
