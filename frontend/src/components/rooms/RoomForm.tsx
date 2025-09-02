"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Room, createRoom, updateRoom, getRoom } from "@/services/roomService";
import toast from "react-hot-toast";
import { ROOM_TYPES, ROOM_STATUSES } from "@/constants/constants";


interface Props {
  mode: "create" | "edit";
  roomId?: string;
}

export default function RoomForm({ mode, roomId }: Props) {
  const router = useRouter();
  const [room, setRoom] = useState<Room>({
    number: 0,
    type: "single",
    status: "available",
    price: 0,
    cover_image: undefined,
    other_images: [],
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [otherPreviews, setOtherPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && roomId) {
      getRoom(roomId).then((data) => {
        setRoom(data);
        if (data.cover_image && typeof data.cover_image === "string") {
          setCoverPreview(data.cover_image);
        }
if (data.other_images) {
  setOtherPreviews(
    data.other_images.map((img: string | File) =>
      typeof img === "string" ? img : URL.createObjectURL(img)
    )
  );
}

      });
    }
  }, [mode, roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "cover_image" && files) {
      const file = files[0];
      setRoom({ ...room, cover_image: file });
      setCoverPreview(URL.createObjectURL(file));
    } else if (name === "other_images" && files) {
      const fileArray = Array.from(files);
      setRoom({ ...room, other_images: fileArray });
      setOtherPreviews(fileArray.map((f) => URL.createObjectURL(f)));
    } else {
      setRoom({ ...room, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "create") await createRoom(room);
      else if (mode === "edit" && roomId) await updateRoom(roomId, room);
      toast.success(`Room ${mode === "create" ? "created" : "updated"} successfully!`);
      router.push("/rooms");
    } catch (err) {
      console.error(err);
      toast.error("Error saving room!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto p-6 bg-white shadow-md rounded-xl space-y-6"
    >
      {/* Room Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room Number
        </label>
        <input
          type="number"
          name="number"
          value={room.number}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${
            mode === "edit" ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          required
          disabled={mode === "edit"}
        />
      </div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Type
  </label>
  <select
    name="type"
    value={room.type}
    onChange={handleChange}
    className="w-full p-2 border rounded"
  >
    {ROOM_TYPES.map((type) => (
      <option key={type} value={type}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </option>
    ))}
  </select>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Status
  </label>
  <select
    name="status"
    value={room.status}
    onChange={handleChange}
    className="w-full p-2 border rounded"
  >
    {ROOM_STATUSES.map((status) => (
      <option key={status} value={status}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </option>
    ))}
  </select>
</div>


      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          name="price"
          value={room.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image
        </label>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50">
          <input
            type="file"
            name="cover_image"
            onChange={handleChange}
            accept="image/*"
            className="hidden"
            id="coverUpload"
          />
          <label htmlFor="coverUpload" className="cursor-pointer text-gray-500">
            Drag & drop or click to upload cover image
          </label>
        </div>
        {coverPreview && (
          <img
            src={coverPreview}
            alt="Cover Preview"
            className="mt-3 w-40 h-28 object-cover rounded-lg shadow"
          />
        )}
      </div>

      {/* Other Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Other Images
        </label>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50">
          <input
            type="file"
            name="other_images"
            onChange={handleChange}
            multiple
            accept="image/*"
            className="hidden"
            id="otherUpload"
          />
          <label htmlFor="otherUpload" className="cursor-pointer text-gray-500">
            Drag & drop or click to upload multiple images
          </label>
        </div>
        {otherPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {otherPreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Other Preview ${idx}`}
                className="w-full h-24 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : mode === "create"
          ? "Create Room"
          : "Update Room"}
      </button>
    </form>
  );
}
