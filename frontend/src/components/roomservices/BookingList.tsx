"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchBookings, updateBookingStatus } from "@/services/serviceApi";
import { getRole } from "@/utils/auth";
import toast from "react-hot-toast";
import Image from "next/image";
import { Check, X } from "lucide-react";

interface Booking {
  id: string;
  service_name: string;
  date: string;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  user_name?: string;
}

const StatusBadge = ({ status }: { status: Booking["status"] }) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

const AdminActions = ({
  bookingId,
  onUpdate,
  currentStatus,
}: {
  bookingId: string;
  onUpdate: (id: string, status: Booking["status"]) => void;
  currentStatus: Booking["status"];
}) => (
  <div className="flex gap-2">
    <button
      onClick={() => onUpdate(bookingId, "accepted")}
      className={`flex items-center justify-center w-8 h-8 rounded transition ${
        currentStatus === "accepted"
          ? "bg-green-200 text-green-800 cursor-not-allowed"
          : "bg-green-100 text-green-600 hover:bg-green-200"
      }`}
      disabled={currentStatus === "accepted"}
      title="Accept"
    >
      <Check size={16} />
    </button>

    <button
      onClick={() => onUpdate(bookingId, "rejected")}
      className={`flex items-center justify-center w-8 h-8 rounded transition ${
        currentStatus === "rejected"
          ? "bg-red-200 text-red-800 cursor-not-allowed"
          : "bg-red-100 text-red-600 hover:bg-red-200"
      }`}
      disabled={currentStatus === "rejected"}
      title="Reject"
    >
      <X size={16} />
    </button>
  </div>
);


export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const role = getRole();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusUpdate = async (id: string, status: Booking["status"]) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking ${status}`);
      loadBookings();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {role === "management" ? "All Bookings" : "My Bookings"}
      </h2>

      {loading && <p className="text-gray-600">Loading bookings...</p>}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No bookings found.</p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-gray-500 font-medium text-sm">Service</th>
                    <th className="px-5 py-3 text-gray-500 font-medium text-sm">Date</th>
                    <th className="px-5 py-3 text-gray-500 font-medium text-sm">Note</th>
                    <th className="px-5 py-3 text-gray-500 font-medium text-sm">Status</th>
                    {role === "management" && <th className="px-5 py-3 text-gray-500 font-medium text-sm">Guest</th>}
                    {role === "management" && <th className="px-5 py-3 text-gray-500 font-medium text-sm">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-gray-800 font-medium text-sm">{booking.service_name}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{booking.date}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{booking.notes || "-"}</td>
                      <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                      {role === "management" && <td className="px-5 py-4 text-gray-500 text-sm">{booking.user_name || "N/A"}</td>}
                      {role === "management" && (
                        <td className="px-5 py-4 flex gap-2">
 <AdminActions 
      bookingId={booking.id} 
      onUpdate={handleStatusUpdate} 
      currentStatus={booking.status} // pass current status
    />                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
