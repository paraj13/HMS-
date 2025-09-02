// utils/api.ts
"use client";

import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers!["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    if (data?.detail === "Token expired" || data?.detail === "Invalid token") {
      toast.error("Session expired. Please login again.");
      window.location.href = "/signin";
    } else {
      toast.error(data?.message || "Something went wrong");
    }

    return Promise.reject(error);
  }
);

export default api;
