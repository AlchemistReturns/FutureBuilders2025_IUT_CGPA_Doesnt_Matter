import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Disease {
    id: string;
    name: string;
    date: string;
    medicines: string;
    comments: string;
}

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Disease History State
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [insight, setInsight] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        medicines: "",
        comments: ""
    });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const fetchInsight = async () => {
        if (!currentUser?.uid) return;
        try {
            setLoadingInsight(true);
            const res = await fetch(`http://localhost:5000/api/ai/insights/${currentUser.uid}`);
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

    const fetchDiseases = async () => {
        if (!currentUser?.uid) return;
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:5000/api/diseases/${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                setDiseases(data.diseases);
                fetchInsight();
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
            const res = await fetch('http://localhost:5000/api/diseases', {
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
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Responsive) */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-6 shadow-xl md:shadow-sm transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex justify-between items-center mb-10">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        HealthX
                    </div>
                    {/* Close Button Mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                    <NavItem icon="🏠" label="Overview" active onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem icon="💬" label="AI Doctor" onClick={() => navigate('/ai-doctor')} />
                    <NavItem icon="📝" label="Symptom Tracker" onClick={() => navigate('/symptom-tracker')} />
                    <NavItem icon="📚" label="Disease Wiki" onClick={() => navigate('/diseases')} />
                    <NavItem icon="🏥" label="Find Hospitals" onClick={() => navigate('/hospitals')} />
                    <NavItem icon="📢" label="Notices" onClick={() => navigate('/notices')} />
                </nav>

                <div className="pt-6 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition font-medium"
                    >
                        <span>🚪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">

                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
                        >
                            <span className="text-2xl">☰</span>
                        </button>

                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-sm md:text-base text-gray-500">Welcome back, {currentUser?.name || "User"}!</p>
                        </div>
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

                {/* Disease History Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">🩺 Disease History</h2>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                        >
                            {showForm ? "Cancel" : "+ Add Record"}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleAddDisease} className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-lg font-bold text-blue-900 mb-4">Add New Record</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Disease Name (e.g. Flu)"
                                    className="p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="date"
                                    className="p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Medicines taken"
                                    className="p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                                    value={formData.medicines}
                                    onChange={e => setFormData({ ...formData, medicines: e.target.value })}
                                />
                                <textarea
                                    placeholder="Comments / Symptoms / Notes"
                                    className="p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                                    value={formData.comments}
                                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Save Record</button>
                        </form>
                    )}

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading history...</div>
                    ) : (
                        <div className="space-y-4">
                            {diseases.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                                    <p>No disease history found. Stay healthy! 💪</p>
                                </div>
                            ) : (
                                <>
                                    {diseases.slice(0, 2).map((d) => (
                                        <div key={d.id} className="p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition flex flex-col md:flex-row justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{d.name}</h3>
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{d.date}</span>
                                                </div>
                                                {d.medicines && (
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        <span className="font-semibold text-blue-600">Rx:</span> {d.medicines}
                                                    </p>
                                                )}
                                                {d.comments && (
                                                    <p className="text-sm text-gray-500 italic">
                                                        "{d.comments}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {diseases.length > 3 && (
                                        <button
                                            onClick={() => navigate('/history')}
                                            className="w-full py-3 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition"
                                        >
                                            View All History ({diseases.length}) →
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
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
                        title="Health Notices"
                        desc="Latest medical alerts."
                        icon="📢"
                        color="from-purple-500 to-pink-500"
                        onClick={() => navigate('/notices')}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                    />
                    <ActionCard
                        title="Nearest Hospitals"
                        desc="Find hospitals closest to you"
                        icon="📢"
                        color="from-purple-500 to-pink-500"
                        onClick={() => navigate('/hospitals')}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                    />
                </div>
            </main>
        </div>
    );
}

// Components

function NavItem({ icon, label, active = false, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
        >
            <span>{icon}</span> {label}
        </button>
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
