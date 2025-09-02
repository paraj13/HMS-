import axios from "axios";


export interface VoiceResponse {
  transcription?: string;
  answer: string;
  action?: string;
}

// Unified function to handle both voice and text
export const sendVoiceToText = async (input: Blob | string): Promise<VoiceResponse> => {
  const formData = new FormData();

  if (typeof input === "string") {
    // Text input
    formData.append("text", input);
  } else {
    // Voice input (Blob)
    formData.append("audio", input, "recording.wav");
  }

  const res = await axios.post("http://127.0.0.1:8000/api/voice-chat/", formData, {
    headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${localStorage.getItem("token")}` },
  });

  return res.data;
};
