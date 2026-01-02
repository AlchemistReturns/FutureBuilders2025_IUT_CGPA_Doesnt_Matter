import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/api';

interface Disease {
    id: string;
    name: string;
    date: string;
    medicines: string;
    comments: string;
}

interface Appointment {
    id: string;
    doctorName: string;
    date: string;
    time: string;
    status: string;
    reason: string;
}

export default function Dashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // State
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [insight, setInsight] = useState("");
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        medicines: "",
        comments: ""
    });

    const fetchInsight = async () => {
        if (!currentUser?.uid) return;
        try {
            setLoadingInsight(true);
            const res = await fetch(`${API_BASE_URL}/api/ai/insights/${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                setInsight(data.insight);
            }
        } catch (err) {
            console.error("Failed to fetch insight", err);
        } finally {
            setLoadingInsight(false);
        }
    };

    const fetchAppointments = async () => {
        if (!currentUser?.uid) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments/patient/${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                setAppointments(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch appointments", err);
        }
    };

    const fetchDiseases = async () => {
        if (!currentUser?.uid) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/diseases/${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                setDiseases(data.diseases);
                fetchInsight();
            }
        } catch (err) {
            console.error("Failed to fetch diseases", err);
        }
    };

    useEffect(() => {
        fetchDiseases();
        fetchAppointments();
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
                fetchDiseases();
            }
        } catch (err) {
            console.error("Failed to add disease", err);
        }
    };

    return (
        <div className="p-4 md:p-8 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {currentUser?.name || "User"}!</p>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                        {currentUser?.name?.[0] || "U"}
                    </div>
                </div>
            </header>

            {/* AI Insight Card */}
            <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="text-4xl">✨</div>
                <div>
                    <h2 className="text-lg font-bold mb-2 opacity-90">AI Health Insight</h2>
                    {loadingInsight ? (
                        <div className="animate-pulse h-4 bg-white/20 rounded w-64"></div>
                    ) : (
                        <p className="text-lg font-medium leading-relaxed">
                            {insight || "Add your disease history to get personalized AI health insights! 🚀"}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Appointments Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">🗓️ Upcoming Appointments</h2>
                    {appointments.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                            <p>No appointments scheduled.</p>
                            <button onClick={() => navigate('/doctors')} className="mt-2 text-blue-600 font-bold hover:underline">Find a Doctor</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.slice(0, 3).map(app => (
                                <div key={app.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{app.doctorName}</h3>
                                        <p className="text-sm text-gray-500">{app.date} at {app.time}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {app.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Disease History Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">🩺 Disease History</h2>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                        >
                            {showForm ? "Cancel" : "+ Add"}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleAddDisease} className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
                            <div className="grid gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="p-3 rounded-xl border"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="date"
                                    className="p-3 rounded-xl border"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Medicines"
                                    className="p-3 rounded-xl border"
                                    value={formData.medicines}
                                    onChange={e => setFormData({ ...formData, medicines: e.target.value })}
                                />
                                <textarea
                                    placeholder="Notes"
                                    className="p-3 rounded-xl border"
                                    value={formData.comments}
                                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold">Save</button>
                        </form>
                    )}

                    <div className="space-y-4">
                        {diseases.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No records found.</p>
                        ) : (
                            diseases.slice(0, 3).map((d) => (
                                <div key={d.id} className="p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 flex justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">{d.name}</h3>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{d.date}</span>
                                        </div>
                                        {d.medicines && <p className="text-xs text-gray-500">Rx: {d.medicines}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                        {diseases.length > 3 && (
                            <button onClick={() => navigate('/history')} className="w-full text-blue-600 font-bold mt-2">View All →</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActionCard
                    title="Consult AI Doctor"
                    desc="Get instant medical advice."
                    icon="🩺"
                    color="from-blue-500 to-indigo-600"
                    onClick={() => navigate('/ai-doctor')}
                />
                <ActionCard
                    title="Track Symptoms"
                    desc="Log your daily potential."
                    icon="📉"
                    color="from-emerald-500 to-teal-600"
                    onClick={() => navigate('/symptom-tracker')}
                />
                <ActionCard
                    title="Search Diseases"
                    desc="Learn about conditions."
                    icon="📚"
                    color="from-orange-400 to-red-500"
                    onClick={() => navigate('/diseases')}
                />
                <ActionCard
                    title="Find Doctors"
                    desc="Book appointments."
                    icon="👨‍⚕️"
                    color="from-blue-500 to-cyan-600"
                    onClick={() => navigate('/doctors')}
                />
            </div>
        </div>
    );
}

function ActionCard({ title, desc, icon, color, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`}></div>

            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
        </button>
    );
}
