import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../context/AuthContext';
import { offlineData } from '../data/offlineData';

interface Message {
    id?: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp?: string;
    hasImage?: boolean;
}

const AiDoctor: React.FC = () => {
    const { currentUser } = useAuth();
    const [input, setInput] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (currentUser?.uid) {
            fetchHistory();
        }
    }, [currentUser]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/chat/history/${currentUser?.uid}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressed = await imageCompression(file, { maxSizeMB: 0.1 });
                setImage(compressed);
            } catch (err) {
                console.error("Compression error:", err);
            }
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !image) return;

        const userMsg: Message = {
            text: input,
            sender: 'user',
            timestamp: new Date().toISOString(),
            hasImage: !!image
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setImage(null);
        setLoading(true);

        console.log("Attempting to send message...");
        console.log("Navigator onLine:", navigator.onLine);
        console.log("Current User:", currentUser);

        // 1. Try Online
        if (navigator.onLine && currentUser?.uid) {
            try {
                console.log("Sending request to backend...");
                const formData = new FormData();
                formData.append('userId', currentUser.uid);
                formData.append('text', userMsg.text);
                if (image) formData.append('image', image);

                const res = await fetch('http://localhost:5000/api/chat/send', {
                    method: 'POST',
                    body: formData
                });

                console.log("Response status:", res.status);

                if (!res.ok) {
                    const errText = await res.text();
                    console.error("Backend Error Response:", errText);
                    throw new Error(`Server Failed: ${res.status} ${errText}`);
                }

                const data = await res.json();
                console.log("Backend Success:", data);
                setMessages(prev => [...prev, data.message]);
                setLoading(false);
                return;

            } catch (err) {
                console.error("Fetch/Network Error:", err);
                // Fallback will happen below
            }
        } else {
            console.warn("Skipping Online: Offline or No User UID");
        }

        // 2. Offline Fallback
        const match = offlineData.find(d => d.keywords.some(k => userMsg.text.toLowerCase().includes(k)));
        const offlineResponse = match
            ? `[OFFLINE] [${match.severity}] ${match.advice}`
            : "[OFFLINE] No internet. Cannot diagnose complex issues. Please see a doctor.";

        const aiMsg: Message = {
            text: offlineResponse,
            sender: 'ai',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-md mx-auto rounded-2xl overflow-hidden bg-white shadow-2xl border">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center gap-2">
                <span className="text-2xl">🩺</span>
                <div>
                    <h1 className="font-bold text-lg">AI Health Assistant</h1>
                    <p className="text-xs opacity-80">Describe symptoms & get guidance</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-gray-50 to-gray-100">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        {/* Assistant Avatar */}
                        {msg.sender !== 'user' && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shadow">
                                🤖
                            </div>
                        )}

                        <div
                            className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${msg.sender === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'
                                }`}
                        >
                            {msg.hasImage && (
                                <div className="text-xs italic text-gray-500 mb-1">
                                    📎 Image attached
                                </div>
                            )}
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {msg.text}
                            </p>
                        </div>

                        {/* User Avatar */}
                        {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm shadow">
                                👤
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                    <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shadow">
                            🤖
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow animate-pulse">
                            <span className="text-sm text-gray-500">Thinking…</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t space-y-2">

                {image && (
                    <div className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="text-green-700 truncate">
                            📷 {image.name}
                        </span>
                        <button
                            onClick={() => setImage(null)}
                            className="text-red-500 font-bold ml-2 hover:scale-110 transition"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Describe your symptoms..."
                        disabled={loading}
                        className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />

                    <label className="cursor-pointer bg-gray-100 p-2 rounded-xl hover:bg-gray-200 transition">
                        📷
                        <input
                            type="file"
                            onChange={handleImage}
                            className="hidden"
                            accept="image/*"
                        />
                    </label>

                    <button
                        onClick={handleSend}
                        disabled={loading || (!input && !image)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:opacity-90 disabled:opacity-50 transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>

    );
};

export default AiDoctor;