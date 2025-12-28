import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
// ✅ UPDATED IMPORT: Points to the file sitting right next to this one
import { offlineData } from '../data/offlineData';

const AiDoctor: React.FC = () => {
    const [symptom, setSymptom] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [advice, setAdvice] = useState("");
    const [source, setSource] = useState("");
    const [loading, setLoading] = useState(false);

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

    const getHelp = async () => {
        setLoading(true);
        setAdvice("Thinking...");

        // 1. Try Online (Backend)
        if (navigator.onLine) {
            try {
                const formData = new FormData();
                formData.append('symptom', symptom);
                if (image) formData.append('image', image);

                // Make sure your backend server is running on port 5000!
                const res = await fetch('http://localhost:5000/api/consult', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error("Server Failed");

                const data = await res.json();
                setAdvice(data.advice);
                setSource("ONLINE (Gemini)");
                setLoading(false);
                return; // Success! Stop here.

            } catch (err) {
                console.log("Server error, switching to offline mode...");
            }
        }

        // 2. Offline Fallback
        const match = offlineData.find(d => d.keywords.some(k => symptom.toLowerCase().includes(k)));

        if (match) {
            setAdvice(`[${match.severity}] ${match.advice}`);
            setSource("OFFLINE (Local Data)");
        } else {
            setAdvice("No internet. Cannot diagnose complex issues. Please see a doctor.");
            setSource("OFFLINE (Local Data)");
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: 20, maxWidth: 400, margin: "auto", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2>Test Hybrid API</h2>

            <textarea
                value={symptom}
                onChange={e => setSymptom(e.target.value)}
                placeholder="Describe symptom (e.g. cut, snake bite)..."
                rows={3}
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />

            <input
                type="file"
                onChange={handleImage}
                style={{ marginBottom: '10px' }}
            />

            <button
                onClick={getHelp}
                disabled={loading}
                style={{
                    padding: '10px',
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                {loading ? "Analyzing..." : "Get Advice"}
            </button>

            {advice && (
                <div style={{ marginTop: 20, background: '#f0f0f0', padding: 15, borderRadius: '5px' }}>
                    <strong style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Source: {source}</strong>
                    <p style={{ margin: 0 }}>{advice}</p>
                </div>
            )}
        </div>
    );
};

export default AiDoctor;