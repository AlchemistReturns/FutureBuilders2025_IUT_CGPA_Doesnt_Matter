import { useEffect, useRef, useState } from "react";

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
        <div className="max-w-md mx-auto h-[calc(100vh-100px)] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white font-bold">
                🩺 AI Symptom Tracker
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none shadow"
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="bg-white p-3 rounded-xl w-fit shadow animate-pulse text-sm text-gray-500">
                        Thinking...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your answer..."
                    disabled={loading}
                    className="flex-1 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
