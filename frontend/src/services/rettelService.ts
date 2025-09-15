import axios from "axios";
const API_BASE_URL = "http://localhost:8000";


// ----------------- Types -----------------
export interface VoiceResponse {
  transcription?: string;
  answer: {
    message?: string;
    suggestions?: { name: string; link?: string }[];
    options?: { label: string; value: string }[];
  };
}

// ----------------- Backend API Calls -----------------

/**
 * Create a new chat session (optional if backend already maintains session)
 */
export const createChatSession = async (agentId: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/create-chat/`, {
      agent_id: agentId,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create chat session:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to create chat session");
  }
};

/**
 * Send a message (text or audio) to backend and get a response from Retell API
 */
export const sendVoiceToText = async (
  content: string | Blob,
  chatId: string
): Promise<VoiceResponse> => {
  try {
    let response;

    if (content instanceof Blob) {
      // Send audio
      const formData = new FormData();
      formData.append("content", content, "audio.wav");
      formData.append("chat_id", "chat_d296cc0c5aa1080b400dd6e9d43");

      response = await axios.post(`${API_BASE_URL}/api/create-chat-completion/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      // Send text
      response = await axios.post(
        `${API_BASE_URL}/api/create-chat-completion/`,
        { content, chat_id: "chat_d296cc0c5aa1080b400dd6e9d43" },
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return response.data as VoiceResponse;
  } catch (error: any) {
    console.error("Failed to get chat response:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to get chat response");
  }
};
