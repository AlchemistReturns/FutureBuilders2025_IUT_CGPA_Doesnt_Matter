import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/api';

interface Disease {
    id: string;
    name: string;
    date: string;
    medicines: string;
    comments: string;
}

export default function DiseaseHistory() {
    const { currentUser } = useAuth();

    // Disease History State
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        medicines: "",
        comments: ""
    });

    const fetchDiseases = async () => {
        if (!currentUser?.uid) return;
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/diseases/${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                setDiseases(data.diseases);
            }
        } catch (err) {
            console.error("Failed to fetch diseases", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, [currentUser]);

    const handleAddDisease = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.uid) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/diseases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, ...formData })
            });

            if (res.ok) {
                setFormData({ name: "", date: "", medicines: "", comments: "" });
                setShowForm(false);
                fetchDiseases(); // Refresh list
            }
        } catch (err) {
            console.error("Failed to add disease", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Medical History</h1>
                        <p className="text-gray-500">Your complete record of past illnesses.</p>
                    </div>
                    <Link to="/dashboard" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Back to Dashboard</Link>
                </div>

                {/* Add Button & Form */}
                <div className="mb-8">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                    >
                        {showForm ? "Cancel" : "+ Add New Record"}
                    </button>

                    {showForm && (
                        <form onSubmit={handleAddDisease} className="mt-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">New Health Record</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Disease Name (e.g. Flu)"
                                    className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="date"
                                    className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Medicines taken (Optional)"
                                    className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                                    value={formData.medicines}
                                    onChange={e => setFormData({ ...formData, medicines: e.target.value })}
                                />
                                <textarea
                                    placeholder="Comments / Symptoms / Notes"
                                    className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                                    value={formData.comments}
                                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Save Record</button>
                        </form>
                    )}
                </div>

                {/* Full List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading records...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {diseases.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100">
                                <div className="text-4xl mb-4">📂</div>
                                <p>No records found.</p>
                            </div>
                        ) : (
                            diseases.map((d) => (
                                <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{d.name}</h3>
                                        <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">{d.date}</span>
                                    </div>
                                    <div className="space-y-2 text-gray-600">
                                        {d.medicines && <p>💊 <span className="font-medium">Meds:</span> {d.medicines}</p>}
                                        {d.comments && <p>📝 <span className="font-medium">Note:</span> {d.comments}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
