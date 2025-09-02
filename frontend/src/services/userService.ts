import axios from "axios";
import { User, UserLoginResponse, DashboardData } from "@/types/user";


const API_BASE_URL = "http://localhost:8000/api/accounts";

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data.data;
};

export const loginUser = async (email: string, password: string): Promise<UserLoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/login/`, { email, password });
  return response.data.data;
};

// 👉 Create user
export const createUser = async (userData: User) => {
  const response = await axios.post(`${API_BASE_URL}/create/`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// 👉 Update user
export const updateUser = async (userId: string, userData: User) => {
  const response = await axios.put(`${API_BASE_URL}/update/${userId}`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// 👉 Get user by id
export const getUserById = async (userId: string) => {
  const response = await axios.get(`${API_BASE_URL}/detail/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data.data;
};

// 👉 List users by role
export const listUsersByRole = async (role: string) => {
  const response = await axios.get(`${API_BASE_URL}/list/?role=${role}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// 👉 Delete user
export const deleteUser = async (userId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/delete/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// 👉 Logout user
export const logoutUser = async () => {
  const refresh_token = localStorage.getItem("token");
  if (!refresh_token) throw new Error("No refresh token found");

  const response = await axios.post(
    `${API_BASE_URL}/logout`,
    { refresh_token }, 
    // {
    //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // access token in header
    // }
  );

  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");

  return response.data;
};
