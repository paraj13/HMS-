import axios from "axios";
import { User, UserLoginResponse, DashboardData } from "@/types/user";
import { deleteCookie } from "cookies-next";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get(`${API_BASE_URL}/accounts/dashboard/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data.data;
};

export const loginUser = async (email: string, password: string): Promise<UserLoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/accounts/login/`, { email, password });
  return response.data.data;
};

// 👉 Create user
export const createUser = async (userData: User) => {
  const response = await axios.post(`${API_BASE_URL}/accounts/create/`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// 👉 Update user
export const updateUser = async (userId: string, userData: User) => {
  const response = await axios.put(`${API_BASE_URL}/accounts/update/${userId}`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// 👉 Get user by id
export const getUserById = async (userId: string) => {
  const response = await axios.get(`${API_BASE_URL}/accounts/detail/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data.data;
};

// 👉 List users by role
export const listUsersByRole = async (role: string) => {
  const response = await axios.get(`${API_BASE_URL}/accounts/list/?role=${role}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// 👉 Delete user
export const deleteUser = async (userId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/accounts/delete/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// 👉 Logout user
export const logoutUser = async () => {
  // Get token from cookies instead of localStorage
  const refresh_token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!refresh_token) throw new Error("No refresh token found");

  const response = await axios.post(`${API_BASE_URL}/accounts/logout`, {
    refresh_token,
  });

  // Delete cookies
  deleteCookie("token", { path: "/" });
  deleteCookie("role", { path: "/" });

  return response.data;
};