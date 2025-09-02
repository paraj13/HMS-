"use client";

import RoomForm from "@/components/rooms/RoomForm";
import { useParams } from "next/navigation";

export default function EditRoomPage() {
  const params = useParams();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id; // ensure string

  return <RoomForm mode="edit" roomId={roomId} />;
}
