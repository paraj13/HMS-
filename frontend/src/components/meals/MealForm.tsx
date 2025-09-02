"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Meal, createMeal, updateMeal, getMeal } from "@/services/mealService";
import toast from "react-hot-toast";
import Select from "react-select"; 

import {
  MEAL_TYPES,
  DIET_TYPES,
  CUISINE_TYPES,
  SPICE_LEVELS,
  MEAL_CATEGORIES,
  CURRENCIES,
} from "@/constants/constants";

interface Props {
  mode: "create" | "edit";
  mealId?: string;
}

export default function MealForm({ mode, mealId }: Props) {
  const router = useRouter();

  const [meal, setMeal] = useState<Meal>({
    name: "",
    category: "",
    description: "",
    currency: "INR",
    price: 0,
    status: true,
    meal_type: "breakfast",
    diet_type: "veg",
    cuisine_type: "indian",
    spice_level: "mild",
    rating: 0,
    is_special: false,
    image: undefined,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (mode === "edit" && mealId) {
      getMeal(mealId).then((data) => {
        setMeal(data);
        if (data.image && typeof data.image === "string") {
          setPreview(data.image);
        }
      });
    }
  }, [mode, mealId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;

    if (name === "image" && files) {
      const file = files[0];
      setMeal({ ...meal, image: file });
      setPreview(URL.createObjectURL(file));
    } else if (type === "checkbox") {
      setMeal({ ...meal, [name]: checked });
    } else if (type === "number") {
      setMeal({ ...meal, [name]: Number(value) });
    } else {
      setMeal({ ...meal, [name]: value });
    }

    // clear error on change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryChange = (selected: any) => {
    setMeal({ ...meal, category: selected ? selected.value : "" });
    setErrors((prev) => ({ ...prev, category: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string> = {};

    // ✅ client-side validation
    if (!meal.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!meal.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (meal.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await createMeal(meal);
      } else if (mode === "edit" && mealId) {
        await updateMeal(mealId, meal);
      }

      toast.success(
        `Meal ${mode === "create" ? "created" : "updated"} successfully!`
      );
      router.push("/meals");
    } catch (err: any) {
      console.error(err);

      // ✅ backend error handling
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        let fieldErrors: Record<string, string> = {};

        Object.entries(backendErrors).forEach(([field, msgArr]) => {
          fieldErrors[field] = Array.isArray(msgArr) ? msgArr[0] : String(msgArr);
        });

        setErrors(fieldErrors);
      } else {
        toast.error("Error saving meal!");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Convert categories to options for react-select
  const categoryOptions = MEAL_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-10 bg-white shadow-md rounded-xl grid grid-cols-6 gap-6"
    >
      {/* Name */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={meal.name}
          onChange={handleChange}
          className={`w-full p-3 border rounded ${
            errors.name ? "border-red-500" : ""
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Category (Searchable) */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <Select
        className="w-full p-1 border rounded"
          options={categoryOptions}
          value={categoryOptions.find((opt) => opt.value === meal?.category) || null}
          onChange={handleCategoryChange}
          placeholder="Select or search a category..."
          isSearchable
          isClearable
        />
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
        )}
      </div>

      {/* Price */}
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Price</label>
  <div className="flex">
    {/* Currency Dropdown */}
<select
  name="currency"
  value={meal.currency}
  onChange={handleChange}
  className="p-3 border rounded w-28"
>
  {CURRENCIES.map((cur) => (
    <option key={cur.code} value={cur.code}>
      {cur.label}
    </option>
  ))}
</select>

    {/* Price Input */}
    <input
      type="number"
      name="price"
      value={meal.price}
      onChange={handleChange}
      className={`flex-1 p-3 border rounded ${
        errors.price ? "border-red-500" : ""
      }`}
      placeholder="Enter price"
    />
  </div>
  {errors.price && (
    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
  )}
</div>


      {/* Description */}
      <div className="col-span-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={meal.description}
          onChange={handleChange}
          rows={3}
          className={`w-full p-3 border rounded ${
            errors.description ? "border-red-500" : ""
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Meal Type */}
      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meal Type
        </label>
        <select
          name="meal_type"
          value={meal.meal_type}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Diet Type */}
      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diet Type
        </label>
        <select
          name="diet_type"
          value={meal.diet_type}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          {DIET_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Cuisine Type */}
      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cuisine
        </label>
        <select
          name="cuisine_type"
          value={meal.cuisine_type}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          {CUISINE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Spice Level */}
      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Spice Level
        </label>
        <select
          name="spice_level"
          value={meal.spice_level}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          {SPICE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Is Special */}
      <div className="col-span-6 flex items-center">
        <input
          type="checkbox"
          name="is_special"
          checked={meal.is_special}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm text-gray-700">Mark as Special</label>
      </div>

      {/* Image Upload */}
      <div className="col-span-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image
        </label>
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50">
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            className="hidden"
            id="mealUpload"
          />
          <label htmlFor="mealUpload" className="cursor-pointer text-gray-500">
            Drag & drop or click to upload
          </label>
        </div>
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 w-full max-w-md h-64 object-cover rounded-lg shadow"
          />
        )}
      </div>

      {/* Submit */}
      <div className="col-span-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Meal"
            : "Update Meal"}
        </button>
      </div>
    </form>
  );
}
