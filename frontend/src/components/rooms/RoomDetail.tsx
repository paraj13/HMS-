"use client";

import { useEffect, useState } from "react";
import { getRoom, Room } from "@/services/roomService";

interface Props {
  id: string;
}

export default function RoomDetail({ id }: Props) {
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    async function fetchRoom() {
      try {
        const data = await getRoom(id);
        setRoom(data);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    }
    if (id) fetchRoom();
  }, [id]);

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-500 animate-pulse">
          Loading room details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          Room {room.number} <span className="text-gray-500">({room.type})</span>
        </h1>
        <div className="flex items-center gap-6 text-lg">
          <p className="text-green-600 font-bold">₹{room.price}</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              room.status === "available"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {room.status}
          </span>
        </div>
      </div>

      {/* Cover image */}
      {room.cover_image && (
        <div className="mb-8">
          <img
            src={
              typeof room.cover_image === "string"
                ? room.cover_image
                : URL.createObjectURL(room.cover_image)
            }
            alt={`Room ${room.number}`}
            className="w-full h-80 object-cover rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Gallery */}
      {room.other_images && room.other_images.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            More Images
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {room.other_images.map((img, i) =>
              typeof img === "string" ? (
                <img
                  key={i}
                  src={img}
                  alt={`Room ${room.number} - ${i}`}
                  className="rounded-lg shadow-md hover:scale-105 transition-transform"
                />
              ) : (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  alt={`Room ${room.number} - ${i}`}
                  className="rounded-lg shadow-md hover:scale-105 transition-transform"
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
