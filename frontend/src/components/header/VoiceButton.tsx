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
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- Parse JSON content ---
  const parseContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return parsed.message ?? parsed;
    } catch {
      return content;
    }
  };

  // --- Render content ---
  const renderContent = (text: string | any) => {
    if (typeof text === "string") return <span>{text}</span>;
    return <pre>{JSON.stringify(text, null, 2)}</pre>;
  };

  // --- Speak bot messages (female voice) ---
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice =
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira")
        ) || voices[0];
      utterance.voice = femaleVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Initialize speech recognition ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice transcript:", transcript);

      if (!chatId) {
        console.warn("Chat not initialized yet!");
        return;
      }

      // Add user message
      setMessages((prev) => [...prev, { sender: "user", text: transcript }]);

      // Call bot API
      await handleBotResponse(transcript);
    };

    recognitionRef.current.onend = () => setListening(false);
  }, [chatId]);

  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! How can I assist you today?";
  if (hour < 18) return "Good afternoon! How can I assist you today?";
  return "Good evening! How can I assist you today?";
};


  // --- Load chat history or create chat ---
  useEffect(() => {
    const storedId = getStoredChatId();

    if (isChatOpen && storedId) {
      setChatId(storedId);
      retrieveChat(storedId)
        .then((res) => {
          if (res?.message_with_tool_calls) {
            const parsedMsgs: Message[] = res.message_with_tool_calls
              .filter((m: any) =>
                ["user", "agent", "tool_call_result"].includes(m.role)
              )
              .map((m: any) => ({
                sender: m.role === "user" ? "user" : "bot",
                text: parseContent(m.content),
              }));
            setMessages(parsedMsgs);
          }
        })
        .catch(console.error);
    } else if (isChatOpen && !storedId) {
      createChat().then((res) => {
        setChatId(res.chat_id);
        storeChatId(res.chat_id);

        const initialMsg: Message = {
          sender: "bot",
          text: getGreeting(),
        };
        setMessages([initialMsg]);
        speak(initialMsg.text!);
      });
    }
  }, [isChatOpen]);

  // --- Auto-scroll ---  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send typed message ---
  const sendMessage = async () => {
    if (!textInput.trim() || !chatId) return;

    const userMsg = textInput.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setTextInput("");

    await handleBotResponse(userMsg);
  };

  // --- Handle bot response ---
  const handleBotResponse = async (input: string) => {
    if (!chatId) return;

    try {
      const res = await createChatCompletion(chatId, input);

      if (res?.messages && Array.isArray(res.messages)) {
        const botMessages: Message[] = res.messages.map((m: any) => ({
          sender: "bot",
          text: parseContent(m.content),
        }));

        setMessages((prev) => [...prev, ...botMessages]);
        botMessages.forEach((msg) => msg.text && speak(msg.text));
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Failed to process message" },
      ]);
    }
  };

  // --- Toggle microphone ---
  const toggleMic = () => {
    if (!recognitionRef.current) return;

    if (listening) recognitionRef.current.stop();
    else recognitionRef.current.start();

    setListening(!listening);
  };

  // --- Clear chat ---
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
  <h2
    className="font-semibold text-lg cursor-pointer"
    onClick={() => router.back()} // <-- go back on click
  >
    <b>HMS </b>Chatbot
  </h2>
            <div className="flex space-x-2">
              <button
                onClick={clearChat}
                className="bg-white text-sky-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Clear
              </button>

              {!forceOpen && (
                <>
                  {/* Restore your ⛶ button */}
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

          {/* Input + Mic */}
          <div className="p-3 border-t flex space-x-2 items-center sticky bottom-0 bg-white z-10">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message or use mic..."
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={sendMessage}
              className="px-3 rounded text-white bg-sky-600 hover:bg-sky-900"
            >
              SEND
            </button>
            <button
              onClick={toggleMic}
              className={`px-3 rounded text-white ${
                listening ? "bg-red-600" : "bg-green-600"
              }`}
            >
              {listening ? "🎙️" : "🎤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
