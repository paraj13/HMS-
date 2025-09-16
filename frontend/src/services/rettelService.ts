import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createChat = async () => {
  const res = await axios.post(`${API_BASE_URL}/create-chat/`);
  return res.data; // should contain { chat_id }
};

export const createChatCompletion = async (chatId: string, content: string) => {
  const res = await axios.post(`${API_BASE_URL}/create-chat-completion/`, {
    chat_id: chatId,
    content,
  });
  return res.data;
};

export const listChats = async () => {
  const res = await axios.get(`${API_BASE_URL}/list-chats/`);
  return res.data;
};

export const endChat = async (chatId: string) => {
  const res = await axios.post(`${API_BASE_URL}/end-chat/${chatId}/`);
  return res.data;
};

export const retrieveChat = async (chatId: string) => {
  const response = await axios.get(`${API_BASE_URL}/retrieve-chat/${chatId}/`);
  return response.data;
};



export const getStoredChatId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rettel_chat_id");
};

export const storeChatId = (chatId: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("rettel_chat_id", chatId);
};

export const clearChatId = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("rettel_chat_id");
};

// ✅ Full Updated Code (with mic + voice control)