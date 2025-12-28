import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type Role = "user" | "assistant";

interface Message {
    role: Role;
    text: string;
}

export default function SymptomTracker() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            text: "Hello! I’ll ask you a few questions to understand your symptoms. What symptom are you experiencing first?"
        }
    ]);

    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (): Promise<void> => {
        if (!input.trim()) return;

        const updatedMessages: Message[] = [
            ...messages,
            { role: "user", text: input }
        ];

        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/symptom-tracker", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ conversation: updatedMessages }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch");
            }

            const data = await res.json();

            setMessages([
                ...updatedMessages,
                { role: "assistant", text: data.reply }
            ]);
        } catch (error) {
            setMessages([
                ...updatedMessages,
                {
                    role: "assistant",
                    text: "Sorry, something went wrong. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-2xl mx-auto rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100 font-sans">

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl backdrop-blur-sm">
                        📉
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">Symptom Tracker</h1>
                        <p className="text-sm opacity-90">Identify potential conditions.</p>
                    </div>
                </div>
                <Link to="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition backdrop-blur-sm border border-white/10">
                    ← Dashboard
                </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 max-h-[600px] overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow shrink-0">
                                🤖
                            </div>
                        )}

                        <div
                            className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === "user"
                                ? "bg-emerald-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                                }`}
                        >
                            {msg.text}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm shadow shrink-0">
                                👤
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow shrink-0">
                            🤖
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse text-sm text-gray-500">
                            Thinking...
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your response..."
                        disabled={loading}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:bg-gray-50 transition"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition shadow hover:shadow-lg disabled:opacity-50 font-semibold"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
