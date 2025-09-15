import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface VoiceResponse {
  transcription?: string;
  answer: string;
  action?: string;
}

// Unified function to handle both voice and text
export const sendVoiceToText = async (
  input: Blob | string,
  sessionId: string
): Promise<VoiceResponse> => {
  const formData = new FormData();

  if (typeof input === "string") {
    formData.append("text", input);
  } else {
    formData.append("audio", input, "recording.wav");
  }

  // attach sessionId
  formData.append("session_id", sessionId);

  const res = await axios.post(`${API_BASE_URL}/voice-chat/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};


