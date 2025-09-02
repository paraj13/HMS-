"use client";

import React, { useState, useEffect } from "react";
import { sendVoiceToText, VoiceResponse } from "@/services/voiceService";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function VoiceChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  let audioChunks: BlobPart[] = [];

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("voiceChatMessages");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem("voiceChatMessages", JSON.stringify(messages));
  }, [messages]);

  // WAV helpers
  const writeUTFBytes = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  const encodeWav = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, length - 8, true);
    writeUTFBytes(view, 8, "WAVE");

    writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChan, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);

    writeUTFBytes(view, 36, "data");
    view.setUint32(40, length - 44, true);

    const channelData = audioBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return buffer;
  };

  const convertToWav = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const wavBuffer = encodeWav(audioBuffer);
    return new Blob([wavBuffer], { type: "audio/wav" });
  };

  // --- Voice recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunks = [];

      const placeholderIndex = messages.length;
      setMessages((prev) => [...prev, { sender: "user", text: "Recording..." }]);
      setIsRecording(true);

      recorder.ondataavailable = (e) => audioChunks.push(e.data);

      recorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const wavBlob = await convertToWav(audioBlob);

        try {
          const res: VoiceResponse = await sendVoiceToText(wavBlob);

          // Update user message
          setMessages((prev) => {
            const updated = [...prev];
            updated[placeholderIndex] = { sender: "user", text: res.transcription || "Voice input" };
            return updated;
          });

          addBotMessage(res.answer || "No response");
        } catch (err) {
          console.error(err);
          setMessages((prev) => {
            const updated = [...prev];
            updated[placeholderIndex] = { sender: "user", text: "Recording failed" };
            updated.push({ sender: "bot", text: "Failed to process audio" });
            return updated;
          });
        }
      };

      recorder.start();
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  // --- Handle text input ---
  const sendTextMessage = async () => {
    if (!textInput.trim()) return;

    const userMessage = textInput.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setTextInput("");

    try {
      const res: VoiceResponse = await sendVoiceToText(userMessage); // send string directly
      addBotMessage(res.answer || "No response");
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Failed to process message" }]);
    }
  };

  // --- Helper to display bot message as list if commas exist ---
const addBotMessage = (response: any) => {
  // Display main message first
  if (response.message) {
    setMessages((prev) => [...prev, { sender: "bot", text: response.message }]);
  }

  // Display suggestions/meals as separate boxes
  if (response.suggestions && Array.isArray(response.suggestions)) {
    response.suggestions.forEach((item: any) => {
      if (typeof item === "string") {
        // Single string suggestion
        setMessages((prev) => [...prev, { sender: "bot", text: `${item}` }]);
      } else if (typeof item === "object" && item !== null) {
        // Object meal suggestion - each field on new line
        const mealText = Object.entries(item)
          .map(([key, value]) => `${value}`)
          .join("\n");
        setMessages((prev) => [...prev, { sender: "bot", text: `${mealText}` }]);
      }
    });
  }
};

  return (
    <>
      {/* Floating Voice Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-5 right-5 w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-sky-900 transition"
      >
        🎤
      </button>

      {/* Chatbot Panel */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-5 w-120 bg-white rounded-xl shadow-xl flex flex-col">
          {/* Chat Header */}
          <div className="bg-sky-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <h2 className="font-semibold">Voice Chatbot</h2>
            <button onClick={() => setIsChatOpen(false)} className="text-xl font-bold">
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-col space-y-2 max-h-70 overflow-y-auto p-3 whitespace-pre-line">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`p-2 rounded max-w-[75%] ${
                    msg.sender === "user" ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Text Input */}
<div className="p-3 border-t flex space-x-2">
  <input
    type="text"
    value={textInput}
    onChange={(e) => setTextInput(e.target.value)}
    placeholder="Type your message..."
    className={`flex-1 p-2 border rounded ${isRecording ? "cursor-not-allowed bg-gray-100" : "cursor-text bg-white"}`}
    onKeyDown={(e) => e.key === "Enter" && sendTextMessage()}
    disabled={isRecording} // disable while recording
  />
  <button
    onClick={sendTextMessage}
    className={`px-3 rounded text-white ${isRecording ? "bg-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-900"}`}
    disabled={isRecording} // disable while recording
  >
    Send
  </button>
</div>
          {/* Voice Record Button */}
          <div className="p-3 border-t flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${
                isRecording ? "bg-red-500 animate-pulse" : "bg-sky-600 hover:bg-sky-900"
              }`}
            >
              {isRecording ? "■" : "🎤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
