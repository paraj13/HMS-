import ServiceDetail from "@/components/roomservices/ServiceDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params; // 👈 Await params before using
  return <ServiceDetail id={id} />;
}
