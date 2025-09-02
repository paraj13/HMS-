// Update page -> app/services/update/[id]/page.tsx
import ServiceForm from "@/components/roomservices/ServiceForm";

export default function UpdateServicePage({ params }: { params: { id: string } }) {
  return <ServiceForm mode="edit" serviceId={params.id} />;
}
