"use client";

import React, { useEffect, useState } from "react";
import { listServices, deleteService, Service } from "@/services/serviceApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Trash2, CalendarCheck } from "lucide-react"; // added booking icon
import { getRole } from "@/utils/auth";

export default function ServiceList() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("guest");
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
    setRole(getRole()); // load role
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await listServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      setDeletingId(id);
      await deleteService(id);
      toast.success("Service deleted successfully!");
      fetchServices();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  };

  // Get a short preview (first 4-5 words) from HTML content
  const getPreview = (html: string, wordCount = 5) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const words = text.split(/\s+/).slice(0, wordCount).join(" ");
    return words;
  };

  if (loading) return <p className="text-center mt-10">Loading services...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        {role !== "guest" && (
          <button
            onClick={() => router.push("/services/create")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
          >
            Create Service
          </button>
        )}
      </div>

      {/* List */}
      {!Array.isArray(services) || services.length === 0 ? (
        <p className="text-center text-gray-500">No services found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const previewText = service.description
              ? getPreview(service.description)
              : "No description provided";

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  y: -4,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                }}
                className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow"
              >
                {/* Action buttons */}
{/* Action buttons */}
<div className="absolute top-3 right-3 flex space-x-2 z-10">
  {/* Admin/Staff: Update + Delete */}
  {role !== "guest" && (
    <>
      {/* Update */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/services/update/${service.id}`);
        }}
        className="p-2 bg-white rounded-full shadow hover:bg-yellow-500 hover:text-white transition"
      >
        <Pencil size={16} />
      </button>

      {/* Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(service.id!);
        }}
        disabled={deletingId === service.id}
        className="p-2 bg-white rounded-full shadow hover:bg-red-600 hover:text-white transition disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
    </>
  )}

  {/* Guest: Book Service */}
  {role === "guest" && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/services/book/${service.id}`);
      }}
      className="p-2 bg-white rounded-full shadow hover:bg-green-600 hover:text-white transition"
    >
      <CalendarCheck size={16} />
    </button>
  )}
</div>


                {/* Service info */}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {service.name}
                  </h2>

                  {/* Category */}
                  {service.category && (
                    <p className="text-sm text-gray-600 mt-2">
                      Category: {service.category}
                    </p>
                  )}

                  {/* Description preview with Read More */}
                  <p className="text-sm text-gray-600 mt-2">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: previewText,
                      }}
                    />
                    {service.description && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDescription(service.description ?? null);
                        }}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        Read More
                      </button>
                    )}
                  </p>

                  {/* Price */}
                  {service.price && (
                    <div className="flex justify-between items-center mt-3 bg-gray-50 p-2 rounded-lg text-sm">
                      <span>Price</span>
                      <span className="font-medium text-blue-600">
                        💲{service.price}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

{/* Full description modal */}
{selectedDescription && (
  <>
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-opacity-50 z-40 backdrop-blur-[2px]"
      onClick={() => setSelectedDescription(null)}
    />

    {/* Modal */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="border border-gray-200 bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] p-6 pointer-events-auto overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Full Description</h2>

        {/* Scrollable Content */}
        <div
          className="text-gray-700 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: selectedDescription }}
        />

        <button
          onClick={() => setSelectedDescription(null)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>

    {/* Prevent body scroll when modal is open */}
    <style jsx global>{`
      body {
        overflow: hidden;
      }
    `}</style>
  </>
)}

    </div>
  );
}
