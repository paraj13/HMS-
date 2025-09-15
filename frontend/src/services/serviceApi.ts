import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export type Service = {
  id?: string;
  name: string;
  category: string;
  description?: string;
  price?: number;
};

// ✅ Get all services
export const listServices = async () => {
  const res = await axios.get(`${API_BASE_URL}/services/`, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// ✅ Get service by id
export const getService = async (id: string) => {
  const res = await axios.get(`${API_BASE_URL}/services/${id}/`, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// ✅ Create service
export const createService = async (service: Service) => {
  const res = await axios.post(`${API_BASE_URL}/services/create/`, service, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data.data;
};

// ✅ Update service
export const updateService = async (id: string, service: Service) => {
  const res = await axios.put(`${API_BASE_URL}/services/${id}/update/`, service, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data.data;
};

// ✅ Delete service
export const deleteService = async (id: string) => {
  const res = await axios.delete(`${API_BASE_URL}/services/${id}/delete/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data.success;
};

export type BookingData = {
  notes?: string;
  date?: string;
  time?: string;
};

export const bookService = async (serviceId: string, bookingData: BookingData = {}) => {
  const res = await axios.post(`${API_BASE_URL}/${serviceId}/book/`, bookingData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data.data;
};

export async function fetchBookings() {
  const res = await axios.get(`${API_BASE_URL}/bookings/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.data.data;
}

// Update booking status (for admins)
export async function updateBookingStatus(bookingId: string, status: string) {
  const res = await axios.post(
    `${API_BASE_URL}/bookings/${bookingId}/status/`,
    { status },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  return res.data.data;
}