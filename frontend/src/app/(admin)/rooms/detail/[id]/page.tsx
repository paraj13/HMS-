import RoomDetail from "@/components/rooms/RoomDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { id } = await params; // 👈 await params before using
  return <RoomDetail id={id} />;
}
