import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 shadow-sm">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-10">
                    HealthX
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem icon="🏠" label="Overview" active />
                    <NavItem icon="💬" label="AI Doctor" onClick={() => navigate('/ai-doctor')} />
                    <NavItem icon="📝" label="Symptom Tracker" onClick={() => navigate('/symptom-tracker')} />
                    <NavItem icon="📚" label="Disease Wiki" onClick={() => navigate('/diseases')} />
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
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">

                {/* Header (Mobile + Desktop User Info) */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">Welcome back, {currentUser?.name || "User"}!</p>
                    </div>

                    {/* Mobile Menu Button (Placeholder for real implementation) */}
                    <button className="md:hidden p-2 text-gray-500">
                        ☰
                    </button>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                            {currentUser?.name?.[0] || "U"}
                        </div>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Health Score"
                        value="85/100"
                        trend="+2% this week"
                        color="bg-emerald-50 text-emerald-600"
                        icon="❤️"
                    />
                    <StatCard
                        title="Consultations"
                        value="12"
                        trend="Total sessions"
                        color="bg-blue-50 text-blue-600"
                        icon="💬"
                    />
                    <StatCard
                        title="Next Checkup"
                        value="Oct 24"
                        trend="Scheduled"
                        color="bg-purple-50 text-purple-600"
                        icon="📅"
                    />
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

function StatCard({ title, value, trend, color, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-xs text-gray-400 mt-1">{trend}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}>
                {icon}
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
