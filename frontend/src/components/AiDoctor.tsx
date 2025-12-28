import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../context/AuthContext';
import { offlineData } from '../data/offlineData';
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown';

interface Message {
    id?: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp?: string;
    hasImage?: boolean;
    status?: 'sending' | 'sent' | 'failed';
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

    // Check for pending messages on load and online event
    useEffect(() => {
        if (currentUser?.uid && navigator.onLine) {
            syncMessages();
        }

        const handleOnline = () => {
            console.log("Back online! Syncing messages...");
            syncMessages();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [currentUser]);

    const syncMessages = async () => {
        const storedQueue = localStorage.getItem("chatQueue");
        if (!storedQueue) return;

        const queue: Message[] = JSON.parse(storedQueue);
        if (queue.length === 0) return;

        console.log("Syncing pending messages:", queue.length);

        const newQueue = [];
        for (const msg of queue) {
            try {
                if (!currentUser?.uid) {
                    newQueue.push(msg);
                    continue;
                }

                const formData = new FormData();
                formData.append('userId', currentUser.uid);
                formData.append('text', msg.text);

                const res = await fetch('http://localhost:5000/api/chat/send', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error("Sync Failed");

                const data = await res.json();

                setMessages(prev => [...prev, data.message]);

            } catch (err) {
                console.error("Sync failed for msg:", msg, err);
                newQueue.push(msg);
            }
        }

        if (newQueue.length > 0) {
            localStorage.setItem("chatQueue", JSON.stringify(newQueue));
        } else {
            localStorage.removeItem("chatQueue");
        }
    };

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
            hasImage: !!image,
            status: 'sending'
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setImage(null);
        setLoading(true);

        // 1. Try Online
        if (navigator.onLine && currentUser?.uid) {
            try {
                const formData = new FormData();
                formData.append('userId', currentUser.uid);
                formData.append('text', userMsg.text);
                if (image) formData.append('image', image);

                const res = await fetch('http://localhost:5000/api/chat/send', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error("Server Failed");

                const data = await res.json();

                // Update user message status to 'sent'
                setMessages(prev => prev.map(m => m === userMsg ? { ...m, status: 'sent' as const } : m).concat(data.message));

                setLoading(false);
                return;

            } catch (err) {
                console.error("Online send failed, falling back to queue...");
            }
        }

        // 2. Offline / Error Handling
        userMsg.status = 'failed';
        setMessages(prev => prev.map(m => m === userMsg ? { ...m, status: 'failed' } : m));

        // Save to local storage queue
        const storedQueue = localStorage.getItem("chatQueue");
        const queue: Message[] = storedQueue ? JSON.parse(storedQueue) : [];
        queue.push(userMsg);
        localStorage.setItem("chatQueue", JSON.stringify(queue));

        // Display Offline AI Response
        const match = offlineData.find(d => d.keywords.some(k => userMsg.text.toLowerCase().includes(k)));
        const offlineResponse = match
            ? `[OFFLINE] [${match.severity}] ${match.advice}`
            : "[OFFLINE] No internet. Message saved and will be sent when online.";

        const aiMsg: Message = {
            text: offlineResponse,
            sender: 'ai',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
    };



    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-2xl mx-auto rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100 font-sans">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl backdrop-blur-sm">
                        🩺
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">AI Health Assistant</h1>
                        <p className="text-sm opacity-90">Always here to help.</p>
                    </div>
                </div>
                <Link to="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition backdrop-blur-sm border border-white/10">
                    ← Dashboard
                </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
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
                            <div className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                                {msg.sender === 'user' ? (
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                ) : (
                                    <ReactMarkdown
                                        className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4"
                                        components={{
                                            // Custom components to ensure styling works within the chat bubble
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                )}
                            </div>
                            {msg.status === 'failed' && (
                                <div className="text-xs text-red-200 mt-1 flex items-center gap-1">
                                    ⚠️ Offline - Saved
                                </div>
                            )}

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