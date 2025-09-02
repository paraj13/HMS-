"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { bookService } from "@/services/serviceApi"; // adjust path if needed

export default function BookServiceForm() {
  const router = useRouter();
  const { id } = useParams(); // get serviceId from URL
  const serviceId = id as string;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await bookService(serviceId, {
        notes,
        date,
        time,
      } as any);

      toast.success("Service booked successfully ✅");
      router.push("/services/book"); // redirect after booking
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to book service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h1 className="text-2xl font-bold mb-6">Book Service</h1>

      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm mb-1">Time</label>
          <input
            type="time"
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => router.push("/services")}
          className="px-4 py-2 rounded-md border border-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
