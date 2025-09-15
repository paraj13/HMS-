"use client";

import { useEffect, useState } from "react";

interface ServiceDetailProps {
  id: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  price?: number;
}

export default function ServiceDetail({ id }: ServiceDetailProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`http://localhost:8000/api/services/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch service");
        }

        const data = await res.json();
        // adjust depending on your backend response
        setService(data.data || data); 
      } catch (error) {
        console.error(error);
        setService(null);
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [id]);

  if (loading) return <p>Loading service...</p>;
  if (!service) return <p>Service not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{service.name}</h1>
      <p className="mt-2 text-gray-700">{service.description}</p>
      <p className="mt-4 text-lg font-semibold">Category: {service.category}</p>
      {service.price !== undefined && (
        <p className="mt-2">Price: ${service.price}</p>
      )}
    </div>
  );
}
