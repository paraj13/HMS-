"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  createChat,
  createChatCompletion,
  endChat,
  retrieveChat,
} from "@/services/rettelService";
import {
  getStoredChatId,
  storeChatId,
  clearChatId,
} from "@/services/rettelService";
import { useRouter } from "next/navigation";

interface Message {
  sender: "user" | "bot";
  text?: string;
}

interface Props {
  forceOpen?: boolean;
}

export default function RetellChatbotModal({ forceOpen = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(forceOpen);
  const [textInput, setTextInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- Helper: parse JSON content ---
  const parseContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.message) return parsed.message;
      return parsed;
    } catch {
      return content;
    }
  };

  // --- Helper: render content ---
  const renderContent = (text: string | any) => {
    if (typeof text === "string") return <span>{text}</span>;
    else if (
      typeof text === "object" &&
      text !== null &&
      "data" in text &&
      text.data?.amenities &&
      Array.isArray(text.data.amenities)
    ) {
      return (
        <ul className="space-y-1">
          {text.data.amenities.map((a: any) => (
            <li key={a.id} className="flex items-center space-x-2">
              <img
                src={a.thumbnail_image}
                alt={a.name}
                className="w-6 h-6 rounded"
              />
              <span>{a.name}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      return <pre>{JSON.stringify(text, null, 2)}</pre>;
    }
  };

  // ✅ Load stored chat if available
  useEffect(() => {
    const storedId = getStoredChatId();

    if (isChatOpen && storedId) {
      setChatId(storedId);

      // retrieve existing chat
      retrieveChat(storedId)
        .then((res) => {
          if (res?.message_with_tool_calls) {
            const parsedMsgs: Message[] = res.message_with_tool_calls
              .filter(
                (m: any) =>
                  m.role === "user" ||
                  m.role === "agent" ||
                  m.role === "tool_call_result"
              )
              .map((m: any) => ({
                sender: m.role === "user" ? "user" : "bot",
                text: parseContent(m.content),
              }));
            setMessages(parsedMsgs);
          } else if (res?.transcript) {
            // fallback: parse transcript string
            const lines = res.transcript.split("\n").filter(Boolean);
            const parsedMsgs: Message[] = lines.map((line: string) => {
              if (line.startsWith("User:"))
                return { sender: "user", text: line.replace("User:", "").trim() };
              if (line.startsWith("Agent:"))
                return { sender: "bot", text: line.replace("Agent:", "").trim() };
              return { sender: "bot", text: line };
            });
            setMessages(parsedMsgs);
          }
        })
        .catch((err) => console.error("Failed to retrieve chat:", err));
    }

    if (isChatOpen && !storedId) {
      createChat().then((res) => {
        setChatId(res.chat_id);
        storeChatId(res.chat_id);

        const initialMsg: Message = {
          sender: "bot",
          text: "Hello 👋 How can I help you today?\n\nPlease choose one of the following options:\n1) Amenities list\n2) Rules list\n3) Services list\n\nKindly provide the option number or state it in words. If you want to start over, you can say \"Start over\" or \"Exit.\"",
        };
        setMessages([initialMsg]);
      });
    }
  }, [isChatOpen]);

  // --- Auto-scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send message ---
  const sendMessage = async () => {
    if (!textInput.trim() || !chatId) return;
    const userMsg = textInput.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setTextInput("");

    try {
      const res = await createChatCompletion(chatId, userMsg);
      if (res?.messages && Array.isArray(res.messages)) {
        const botMessages = res.messages.map((m: any) => ({
          sender: "bot" as const,
          text: parseContent(m.content),
        }));
        setMessages((prev) => [...prev, ...botMessages]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Failed to process message" },
      ]);
    }
  };

  // --- Clear Chat ---
  const clearChat = async () => {
    if (chatId) await endChat(chatId);
    setMessages([]);
    setChatId(null);
    clearChatId();
  };

  return (
    <>
      {!forceOpen && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-sky-900 transition"
        >
          💬
        </button>
      )}

      {isChatOpen && (
        <div
          className={`flex flex-col ${
            forceOpen
              ? "fixed inset-0 w-full h-full bg-white z-50"
              : "fixed bottom-24 right-5 w-96 h-[500px] bg-white rounded-xl shadow-xl"
          }`}
        >
          {/* Header */}
          <div className="bg-sky-600 text-white p-3 flex justify-between items-center sticky top-0 z-10">
            <h2 className="font-semibold text-lg">Retell Chatbot</h2>
            <div className="flex space-x-2">
              <button
                onClick={clearChat}
                className="bg-white text-sky-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Clear
              </button>
              {forceOpen ? (
                <button
                  onClick={() => window.history.back()}
                  className="bg-white text-sky-600 px-3 py-1 rounded hover:bg-gray-100"
                >
                  ← Back
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/voice-chat")}
                    className="text-white hover:text-gray-200 text-xl"
                  >
                    ⛶
                  </button>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-xl font-bold"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.text && (
                  <div
                    className={`p-2 rounded max-w-[75%] ${
                      msg.sender === "user" ? "bg-blue-100" : "bg-gray-200"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {renderContent(msg.text)}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex space-x-2 items-center sticky bottom-0 bg-white z-10">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={sendMessage}
              className="px-3 rounded text-white bg-sky-600 hover:bg-sky-900"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
