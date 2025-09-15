import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export type Room = {
  id?: string;
  number: number;
  type: string;
  status: string;
  price: number;
  cover_image: string | File | undefined;
  other_images?: (string | File)[] | undefined;

};

// List all rooms
export const listRooms = async () => {
  const res = await axios.get(`${API_BASE_URL}/rooms/`, {
  });
  return res.data.data;
};

// Get room by id
export const getRoom = async (id: string) => {
  const res = await axios.get(`${API_BASE_URL}/rooms/${id}`,{
    headers: { "Content-Type": "multipart/form-data"  },
    
  });
  return res.data.data;
};

// Create room
export const createRoom = async (room: Room) => {
  const formData = new FormData();
  formData.append("number", room.number.toString());
  formData.append("type", room.type);
  formData.append("status", room.status);
  formData.append("price", room.price.toString());
  if (room.cover_image instanceof File) formData.append("cover_image", room.cover_image);
  if (room.other_images) {
    (room.other_images as File[]).forEach((file) => formData.append("other_images", file));
  }
  const res = await axios.post(`${API_BASE_URL}/rooms/create/`, formData, {
 headers: { 
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${localStorage.getItem("token")}` 
    },    
  });
  return res.data.data;
};


export const updateRoom = async (id: string, room: Room) => {
  const formData = new FormData();
  formData.append("type", room.type);
  formData.append("status", room.status);
  formData.append("price", room.price.toString());

  if (room.cover_image instanceof File) {
    formData.append("cover_image", room.cover_image);
  }

  if (room.other_images) {
    (room.other_images as (File | string)[]).forEach((file) => {
      if (file instanceof File) {
        formData.append("other_images", file); // ✅ only new uploads
      }
    });
  }

  const res = await axios.put(`${API_BASE_URL}/${id}/rooms/update/`, formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${localStorage.getItem("token")}` 
    },
  });
  return res.data.data;
};


// Delete room
export const deleteRoom = async (id: string) => {
  const res = await axios.delete(`${API_BASE_URL}/rooms/${id}/delete/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.data.success;
};
