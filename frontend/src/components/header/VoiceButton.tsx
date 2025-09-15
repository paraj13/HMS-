"use client";

import React, { useState, useEffect, useRef } from "react";
import { sendVoiceToText, VoiceResponse } from "@/services/voiceService";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

interface Option {
  label: string;
  value: string;
  link?: string;
}

interface Suggestion {
  name: string;
  link: string;
}

interface Message {
  sender: "user" | "bot";
  text?: string;
  items?: { name: string; link: string }[];
  sideBySide?: boolean;
  suggestions?: Suggestion[];
  options?: Option[];
}

interface Props {
  forceOpen?: boolean;
}

export default function VoiceChatbotModal({ forceOpen = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(forceOpen);
  const [textInput, setTextInput] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const router = useRouter();

  // --- Session ID state ---
  const [sessionId, setSessionId] = useState<string>(() => {
    let storedId = localStorage.getItem("chatSessionId");
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem("chatSessionId", storedId);
    }
    return storedId;
  });

  // --- Load messages from localStorage on mount ---
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // --- Save messages to localStorage whenever they change ---
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Greeting only once if no saved messages
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const automaticGreeting = "hi";
      setMessages([{ sender: "user", text: automaticGreeting }]);
      sendVoiceToText(automaticGreeting, sessionId).then((res) => addBotMessage(res));
    }
  }, [isChatOpen, sessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- WAV Helpers ---
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

  // --- Voice Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunksRef.current = [];

      const placeholderIndex = messages.length;
      setMessages((prev) => [...prev, { sender: "user", text: "Recording..." }]);
      setIsRecording(true);

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      recorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const wavBlob = await convertToWav(audioBlob);

        try {
          const res: VoiceResponse = await sendVoiceToText(wavBlob, sessionId);

          setMessages((prev) => {
            const updated = [...prev];
            updated[placeholderIndex] = { sender: "user", text: res.transcription || "Voice input" };
            return updated;
          });

          addBotMessage(res);
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

  // --- Text Input ---
  const sendTextMessage = async () => {
    if (!textInput.trim()) return;
    const userMessage = textInput.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setTextInput("");

    try {
      const res: VoiceResponse = await sendVoiceToText(userMessage, sessionId);
      addBotMessage(res);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Failed to process message" }]);
    }
  };

  // --- Add Bot Message ---
  const addBotMessage = (response: any) => {
    const newMessages: Message[] = [];
    if (response.answer.message) {
      newMessages.push({ sender: "bot", text: response.answer.message });
    }

    if (response.answer.suggestions && Array.isArray(response.answer.suggestions)) {
      const safeSuggestions = response.answer.suggestions.map((s: any) => ({
        name: s.name || s.label || s.toString(),
        link: s.link || "#",
      }));
      newMessages.push({ sender: "bot", suggestions: safeSuggestions });
    }

    if (response.answer.options && Array.isArray(response.answer.options)) {
      const safeOptions = response.answer.options.map((opt: any) =>
        typeof opt === "string"
          ? { label: opt, value: opt }
          : { label: opt.label, value: opt.value }
      );
      newMessages.push({ sender: "bot", options: safeOptions });
    }

    setMessages((prev) => [...prev, ...newMessages]);
  };

  // --- Clear Chat ---
  const clearChat = async () => {
    // Remove both session and messages
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatSessionId");

    // Generate new sessionId
    const newId = uuidv4();
    localStorage.setItem("chatSessionId", newId);
    setSessionId(newId);

    // Reset UI
    setMessages([{ sender: "user", text: "reset" }]);

    try {
      const res: VoiceResponse = await sendVoiceToText("reset", newId);
      addBotMessage(res);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Failed to reset session" }]);
    }
  };

  const handleBack = () => window.history.back();

  return (
    <>
      {!forceOpen && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-5 right-5 w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-sky-900 transition"
        >
          🎤
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
            <h2 className="font-semibold text-lg">Voice Chatbot</h2>
            <div className="flex space-x-2">
              <button
                onClick={clearChat}
                className="bg-white text-sky-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Clear
              </button>
              {forceOpen ? (
                <button
                  onClick={handleBack}
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
                  <button onClick={() => setIsChatOpen(false)} className="text-xl font-bold">
                    ×
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.text && (
                  <div
                    className={`p-2 rounded max-w-[75%] ${
                      msg.sender === "user" ? "bg-blue-100" : "bg-gray-200"
                    }`}
                        style={{ whiteSpace: "pre-line" }}   // <-- ADD THIS

                  >
                    {msg.text}
                  </div>
                )}

                {msg.suggestions && (
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (s.link && s.link !== "#") {
                            router.push(s.link);
                          } else {
                            setMessages((prev) => [...prev, { sender: "user", text: s.name }]);
                            sendVoiceToText(s.name, sessionId).then((res) => addBotMessage(res));
                          }
                        }}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-200"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}

                {msg.options && (
                  <div className="flex flex-wrap gap-2">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setMessages((prev) => [...prev, { sender: "user", text: opt.value }]);
                          sendVoiceToText(opt.value, sessionId).then((res) => addBotMessage(res));
                        }}
                        className="bg-sky-600 text-white px-3 py-1 rounded-lg hover:bg-sky-900 text-sm"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input + Voice */}
          <div className="p-3 border-t flex space-x-2 items-center sticky bottom-0 bg-white z-10">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message..."
              className={`flex-1 p-2 border rounded ${
                isRecording ? "cursor-not-allowed bg-gray-100" : "cursor-text bg-white"
              }`}
              onKeyDown={(e) => e.key === "Enter" && sendTextMessage()}
              disabled={isRecording}
            />
            <button
              onClick={sendTextMessage}
              className={`px-3 rounded text-white ${
                isRecording ? "bg-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-900"
              }`}
              disabled={isRecording}
            >
              Send
            </button>
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

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { sendVoiceToText, createChatSession, VoiceResponse } from "@/services/rettelService";
// import { useRouter } from "next/navigation";
// import { v4 as uuidv4 } from "uuid";

// interface Option {
//   label: string;
//   value: string;
// }

// interface Suggestion {
//   name: string;
//   link?: string;
// }

// interface Message {
//   sender: "user" | "bot";
//   text?: string;
//   suggestions?: Suggestion[];
//   options?: Option[];
// }

// interface Props {
//   forceOpen?: boolean;
//   agentId?: string;
// }

// export default function VoiceChatbotModal({ forceOpen = false, agentId }: Props) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(forceOpen);
//   const [textInput, setTextInput] = useState("");
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
//   const [sessionId, setSessionId] = useState<string>("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const audioChunksRef = useRef<BlobPart[]>([]);
//   const router = useRouter();

//   // --- Initialize sessionId on client ---
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const storedId = localStorage.getItem("chatSessionId") || uuidv4();
//     localStorage.setItem("chatSessionId", storedId);
//     setSessionId(storedId);

//     const savedMessages = localStorage.getItem("chatMessages");
//     if (savedMessages) setMessages(JSON.parse(savedMessages));
//   }, []);

//   // --- Save messages to localStorage ---
//   useEffect(() => {
//     if (messages.length > 0 && typeof window !== "undefined") {
//       localStorage.setItem("chatMessages", JSON.stringify(messages));
//     }
//   }, [messages]);

//   // --- Auto-scroll ---
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // --- Greeting ---
//   useEffect(() => {
//     if (isChatOpen && messages.length === 0 && sessionId) {
//       handleUserMessage("hi");
//     }
//   }, [isChatOpen, sessionId]);

//   // --- WAV conversion ---
//   const writeUTFBytes = (view: DataView, offset: number, str: string) => {
//     for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
//   };

//   const encodeWav = (audioBuffer: AudioBuffer) => {
//     const numOfChan = audioBuffer.numberOfChannels;
//     const length = audioBuffer.length * numOfChan * 2 + 44;
//     const buffer = new ArrayBuffer(length);
//     const view = new DataView(buffer);

//     writeUTFBytes(view, 0, "RIFF");
//     view.setUint32(4, length - 8, true);
//     writeUTFBytes(view, 8, "WAVE");
//     writeUTFBytes(view, 12, "fmt ");
//     view.setUint32(16, 16, true);
//     view.setUint16(20, 1, true);
//     view.setUint16(22, numOfChan, true);
//     view.setUint32(24, audioBuffer.sampleRate, true);
//     view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChan, true);
//     view.setUint16(32, numOfChan * 2, true);
//     view.setUint16(34, 16, true);
//     writeUTFBytes(view, 36, "data");
//     view.setUint32(40, length - 44, true);

//     const channelData = audioBuffer.getChannelData(0);
//     let offset = 44;
//     for (let i = 0; i < channelData.length; i++, offset += 2) {
//       const s = Math.max(-1, Math.min(1, channelData[i]));
//       view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
//     }
//     return buffer;
//   };

//   const convertToWav = async (blob: Blob) => {
//     const arrayBuffer = await blob.arrayBuffer();
//     const audioCtx = new AudioContext();
//     const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
//     return new Blob([encodeWav(audioBuffer)], { type: "audio/wav" });
//   };

//   // --- Handle User Message ---
//   const handleUserMessage = async (msg: string | Blob) => {
//     const placeholderIndex = messages.length;
//     setMessages((prev) => [
//       ...prev,
//       { sender: "user", text: msg instanceof Blob ? "Recording..." : msg },
//     ]);

//     try {
//       const response: VoiceResponse = await sendVoiceToText(msg, sessionId);
//       if (!(msg instanceof Blob)) {
//         setMessages((prev) => {
//           const updated = [...prev];
//           updated[placeholderIndex] = { sender: "user", text: msg };
//           return updated;
//         });
//       }
//       addBotMessage(response);
//     } catch (err) {
//       console.error(err);
//       setMessages((prev) => {
//         const updated = [...prev];
//         updated[placeholderIndex] = { sender: "user", text: "Failed to send" };
//         updated.push({ sender: "bot", text: "Failed to process message" });
//         return updated;
//       });
//     }
//   };

//   // --- Add Bot Message ---
//   const addBotMessage = (response: VoiceResponse) => {
//     const newMessages: Message[] = [];
//     if (response.answer.message) newMessages.push({ sender: "bot", text: response.answer.message });
//     if (response.answer.suggestions) newMessages.push({ sender: "bot", suggestions: response.answer.suggestions });
//     if (response.answer.options) newMessages.push({ sender: "bot", options: response.answer.options });
//     setMessages((prev) => [...prev, ...newMessages]);
//   };

//   // --- Voice Recording ---
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       setMediaRecorder(recorder);
//       audioChunksRef.current = [];
//       setIsRecording(true);

//       recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
//       recorder.onstop = async () => {
//         setIsRecording(false);
//         const wavBlob = await convertToWav(new Blob(audioChunksRef.current, { type: "audio/webm" }));
//         handleUserMessage(wavBlob);
//       };

//       recorder.start();
//     } catch (err) {
//       console.error(err);
//       alert("Microphone access denied");
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && isRecording) {
//       mediaRecorder.stop();
//       setMediaRecorder(null);
//     }
//   };

//   // --- Send Text ---
//   const sendTextMessage = () => {
//     if (!textInput.trim()) return;
//     handleUserMessage(textInput.trim());
//     setTextInput("");
//   };

//   // --- Clear Chat ---
//   const clearChat = () => {
//     localStorage.removeItem("chatMessages");
//     localStorage.removeItem("chatSessionId");
//     const newId = uuidv4();
//     localStorage.setItem("chatSessionId", newId);
//     setSessionId(newId);
//     setMessages([]);
//   };

//   return (
//     <>
//       {!forceOpen && (
//         <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-5 right-5 w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-sky-900 transition">
//           🎤
//         </button>
//       )}

//       {isChatOpen && (
//         <div className={`flex flex-col ${forceOpen ? "fixed inset-0 w-full h-full bg-white z-50" : "fixed bottom-24 right-5 w-96 h-[500px] bg-white rounded-xl shadow-xl"}`}>
//           {/* Header */}
//           <div className="bg-sky-600 text-white p-3 flex justify-between items-center sticky top-0 z-10">
//             <h2 className="font-semibold text-lg">Voice Chatbot</h2>
//             <div className="flex space-x-2">
//               <button onClick={clearChat} className="bg-white text-sky-600 px-3 py-1 rounded hover:bg-gray-100">Clear</button>
//               {forceOpen && <button onClick={() => window.history.back()} className="bg-white text-sky-600 px-3 py-1 rounded hover:bg-gray-100">← Back</button>}
//               {!forceOpen && (
//                 <>
//                   <button onClick={() => router.push("/voice-chat")} className="text-white hover:text-gray-200 text-xl">⛶</button>
//                   <button onClick={() => setIsChatOpen(false)} className="text-xl font-bold">×</button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-auto p-3 space-y-3">
//             {messages.map((msg, idx) => (
//               <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
//                 {msg.text && <div className={`p-2 rounded max-w-[75%] ${msg.sender === "user" ? "bg-blue-100" : "bg-gray-200"}`} style={{ whiteSpace: "pre-line" }}>{msg.text}</div>}
//                 {msg.suggestions && <div className="flex flex-wrap gap-2">{msg.suggestions.map((s, i) => (
//                   <button key={i} onClick={() => handleUserMessage(s.name)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">{s.name}</button>
//                 ))}</div>}
//                 {msg.options && <div className="flex flex-wrap gap-2">{msg.options.map((o, i) => (
//                   <button key={i} onClick={() => handleUserMessage(o.value)} className="bg-sky-600 text-white px-3 py-1 rounded-lg hover:bg-sky-900 text-sm">{o.label}</button>
//                 ))}</div>}
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input + Voice */}
//           <div className="p-3 border-t flex space-x-2 items-center sticky bottom-0 bg-white z-10">
//             <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendTextMessage()} placeholder="Type your message..." className={`flex-1 p-2 border rounded ${isRecording ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-text"}`} disabled={isRecording} />
//             <button onClick={sendTextMessage} className={`px-3 rounded text-white ${isRecording ? "bg-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-900"}`} disabled={isRecording}>Send</button>
//             <button onClick={isRecording ? stopRecording : startRecording} className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${isRecording ? "bg-red-500 animate-pulse" : "bg-sky-600 hover:bg-sky-900"}`}>{isRecording ? "■" : "🎤"}</button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
