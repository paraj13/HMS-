"use client";

import React, { useEffect, useState } from "react";
import { createUser, updateUser, getUserById } from "@/services/userService";
import { User } from "@/types/user";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  mode: "create" | "edit";
}

export default function UserForm({ mode }: Props) {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string | undefined;
  const role = params?.role as string;

  const [formData, setFormData] = useState<User>({
    username: "",
    email: "",
    mobile_no: "",
    password: "",
    city: "",
    role: role || "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data when in edit mode
  useEffect(() => {
    if (mode === "edit" && userId) {
      getUserById(userId).then((data) =>
        setFormData({
          username: data.username ?? "",
          email: data.email ?? "",
          mobile_no: data.mobile_no ?? "",
          password: "",
          city: data.city ?? "",
          role: data.role ?? role ?? "",
          is_active: data.is_active ?? true,
        })
      );
    }
  }, [mode, userId, role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  // ✅ Client-side validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    const mobileRegex = /^[0-9]{10,15}$/;
    if (!formData.mobile_no || !mobileRegex.test(formData.mobile_no)) {
      newErrors.mobile_no = "Enter a valid mobile number (10-15 digits).";
    }

    if (formData.city && formData.city.length < 2) {
      newErrors.city = "City must be at least 2 characters.";
    }

    if (!formData.role) {
      newErrors.role = "Role is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors.");
      return;
    }

    try {
      if (mode === "create") {
        await createUser(formData);
        toast.success("✅ User created successfully!");
      } else if (mode === "edit" && userId) {
        await updateUser(userId, formData);
        toast.success("✅ User updated successfully!");
      }

      router.push(`/users/${formData.role}`);
    } catch (error) {
      console.error(error);
      toast.error("❌ Error while saving user.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-6 bg-white shadow-md rounded-xl"
    >
      <h2 className="text-xl font-bold mb-4">
        {mode === "create" ? "Create User" : "Edit User"}
      </h2>

      {/* Username */}
      <div>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          disabled={mode === "edit"} // ✅ disable in edit mode
          value={formData.email || ""}
          onChange={handleChange}
    className={`w-full p-2 border rounded ${mode === "edit" ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* Mobile */}
      <div>
        <input
          type="text"
          name="mobile_no"
          placeholder="Mobile Number"
          value={formData.mobile_no || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.mobile_no && <p className="text-red-500 text-sm">{errors.mobile_no}</p>}
      </div>

      {/* City */}
      <div>
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
      </div>

      {/* Role */}
      <div>
        <select
          name="role"
          disabled={mode === "edit"} // ✅ disable in edit mode
          value={formData.role || ""}
          onChange={handleChange}
    className={`w-full p-2 border rounded ${mode === "edit" ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">Select Role</option>
          <option value="management">Management</option>
          <option value="hotel-staff">Hotel Staff</option>
          <option value="guest">Guest</option>
        </select>
        {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        {mode === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}
