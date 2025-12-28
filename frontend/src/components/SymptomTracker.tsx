import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function SymptomTracker() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hello! I’ll ask you a few questions to understand your symptoms. What symptom are you experiencing first?"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const updatedMessages = [
            ...messages,
            { role: "user", text: input }
        ];

        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/symptom-check", {
                conversation: updatedMessages
            });

            setMessages([
                ...updatedMessages,
                { role: "assistant", text: res.data.reply }
            ]);
        } catch (err) {
            setMessages([
                ...updatedMessages,
                {
                    role: "assistant",
                    text: "Sorry, something went wrong. Please try again."
                }
            ]);
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto h-[calc(100vh-100px)] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white font-bold">
                🩺 AI Symptom Tracker
            </div>

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
                    <div className="bg-white p-3 rounded-xl w-fit shadow animate-pulse">
                        Thinking...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Type your answer..."
                    className="flex-1 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
