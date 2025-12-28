import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, Calendar, Activity, Settings, LogOut } from "lucide-react";

export default function DoctorDashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.uid) {
            fetchAppointments();
        }
    }, [currentUser]);

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/doctor/${currentUser?.uid}`);
            const data = await response.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Optimistic update or refetch
                fetchAppointments(); // Simple refetch for now
            }
        } catch (error) {
            console.error(`Failed to ${status} appointment`, error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-blue-50 flex flex-col md:flex-row font-sans">

            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-blue-100 p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-800 mb-10 flex items-center gap-2">
                    <Activity className="text-blue-600" /> HealthX
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem icon={<Users size={20} />} label="My Patients" active />
                    <NavItem icon={<Calendar size={20} />} label="Appointments" />
                    <NavItem icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="pt-6 border-t border-blue-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition font-medium"
                    >
                        <LogOut size={20} /> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                        <p className="text-gray-500">Welcome back, Dr. {currentUser?.email?.split('@')[0]}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        Dr
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Appointments" value={appointments.length} icon={<Users />} color="bg-blue-500" />
                    <StatCard title="Pending Requests" value={appointments.filter(a => a.status === 'pending').length} icon={<Calendar />} color="bg-emerald-500" />
                    <StatCard title="Today's Schedule" value="0" icon={<Activity />} color="bg-orange-500" />
                </div>

                {/* Appointment Requests Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Appointment Requests</h2>

                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading requests...</div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No appointment requests yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition border border-gray-100">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {apt.patientName?.[0]?.toUpperCase() || 'P'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{apt.patientName || 'Unknown Patient'}</h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span>📅 {apt.date}</span>
                                                <span>⏰ {apt.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 italic">"{apt.reason}"</p>
                                        </div>
                                    </div>

                                    {apt.status === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(apt.id, 'accepted')}
                                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(apt.id, 'rejected')}
                                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold text-sm transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${apt.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {apt.status}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'}`}>
            {icon} {label}
        </button>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-lg`}>
                {icon}
            </div>
        </div>
    );
}
