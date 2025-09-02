"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Service,
  createService,
  updateService,
  getService,
} from "@/services/serviceApi";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { SERVICE_CATEGORIES } from "@/constants/constants";

// ✅ ReactQuill dynamic import
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface Props {
  mode: "create" | "edit";
  serviceId?: string;
}

export default function ServiceForm({ mode, serviceId }: Props) {
  const router = useRouter();
  const [service, setService] = useState<Service>({
    name: "",
    description: "",
    category: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch service data when editing
  useEffect(() => {
    if (mode === "edit" && serviceId) {
      getService(serviceId)
        .then((data) => setService(data))
        .catch(() => toast.error("Failed to load service data"));
    }
  }, [mode, serviceId]);

  // ✅ Handle input & select changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setService({
      ...service,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    });
  };

  // ✅ Handle rich text editor changes
  const handleDescriptionChange = (value: string) => {
    setService({ ...service, description: value });
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "create") {
        await createService(service);
      } else if (mode === "edit" && serviceId) {
        await updateService(serviceId, service);
      }
      toast.success(
        `Service ${mode === "create" ? "created" : "updated"} successfully!`
      );
      router.push("/services");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.name?.[0] || "Error saving service!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto p-6 bg-white shadow-md rounded-xl space-y-6"
    >
      <div className="grid grid-cols-12 gap-4">
        {/* Name */}
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={service.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Category */}
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={service.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Category</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            name="price"
            step="0.01"
            value={service.price ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Description (Rich Text Editor) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <ReactQuill
          value={service.description}
          onChange={handleDescriptionChange}
          theme="snow"
          className="bg-white"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : mode === "create"
          ? "Create Service"
          : "Update Service"}
      </button>
    </form>
  );
}
