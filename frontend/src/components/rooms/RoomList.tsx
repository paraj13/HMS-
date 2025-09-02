"use client";

import React, { useEffect, useState, useEffect as useReactEffect } from "react";
import { listRooms, deleteRoom, Room } from "@/services/roomService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { getRole } from "@/utils/auth"; 


// ✅ Image slider with auto-slide + dots
function ImageSlider({
  mainImage,
  otherImages,
}: {
  mainImage: string;
  otherImages?: string[];
}) {
  const [index, setIndex] = useState(0);
  const images = [mainImage, ...(otherImages ?? [])];

  // Auto slide every 4s
  useReactEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-48 overflow-hidden rounded mb-4 cursor-pointer">
      <img
        src={images[index]}
        alt={`Room image ${index + 1}`}
        className="w-full h-48 object-cover rounded transition duration-500"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder-image.png";
        }}
      />

      {/* dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`w-2 h-2 rounded-full ${
                i === index ? "bg-white" : "bg-gray-400"
              }`}
              aria-label={`Go to image ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoomList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("guest");

  useEffect(() => {
    fetchRooms();

    // ✅ Load role from auth util
    const userRole = getRole();
    setRole(userRole);
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await listRooms();
      setRooms(Array.isArray(data) ? data : []); // ✅ Always store array
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure to delete this room?")) return;
    try {
      setDeletingId(id);
      await deleteRoom(id);
      toast.success("Room deleted successfully!");
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete room");
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (image?: string | File) => {
  if (!image) return "/images/img-not-found.png"; // ✅ default image
  return typeof image === "string" ? image : URL.createObjectURL(image);
};


  if (loading) return <p className="text-center mt-10">Loading rooms...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rooms</h1>
        {role !== "guest" && (
        <button
          onClick={() => router.push("/rooms/create")}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
        >
          Create Room
        </button>
      )}
      </div>

{!Array.isArray(rooms) || rooms.length === 0 ? (
  <p className="text-center text-gray-500">No rooms found</p>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {rooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}
              className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow cursor-pointer"
 onClick={() => {
    if (role !== "guest") {
      router.push(`/rooms/update/${room.id}`);
    }
  }}            >
              
              {/* Action buttons */}
              
     {role !== "guest" && (
                <div className="absolute top-3 right-3 flex space-x-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/rooms/update/${room.id}`);
                    }}
                    className="p-2 bg-white rounded-full shadow hover:bg-yellow-500 hover:text-white transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(room.id!);
                    }}
                    disabled={deletingId === room.id}
                    className="p-2 bg-white rounded-full shadow hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              {/* ✅ Auto-sliding Image slider */}
<ImageSlider
  mainImage={getImageUrl(room.cover_image)}
  otherImages={
    Array.isArray(room.other_images)
      ? room.other_images.map((img) =>
          typeof img === "string" ? img : URL.createObjectURL(img)
        )
      : []
  }
/>



              {/* Room info */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Room {room.number}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Type: {room.type}</p>
                <div className="flex justify-between items-center mt-3 bg-gray-50 p-2 rounded-lg text-sm">
                  <span>Status: {room.status}</span>
                  <span className="font-medium text-blue-600">
                    💲{room.price}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
