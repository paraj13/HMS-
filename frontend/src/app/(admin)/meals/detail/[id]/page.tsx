// src/app/(admin)/meals/detail/[id]/page.tsx
"use client";
import MealDetail from "@/components/meals/MealDetail";

interface Props {
  params: { id: string };
}

export default function MealDetailPage({ params }: Props) {
  return <MealDetail mealId={params.id} />;
}
