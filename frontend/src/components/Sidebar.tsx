import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavItemProps {
    icon: string;
    label: string;
    onClick?: () => void;
    active?: boolean;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
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

interface SidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
    const navigate = useNavigate();
    const { logout, currentUser } = useAuth();
    const currentPath = window.location.pathname;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const patientItems = [
        { icon: "🏠", label: "Overview", path: "/dashboard" },
        { icon: "👨‍⚕️", label: "Find Doctors", path: "/doctors" },
        { icon: "💬", label: "AI Doctor", path: "/ai-doctor" },
        { icon: "📝", label: "Symptom Tracker", path: "/symptom-tracker" },
        { icon: "📚", label: "Disease Wiki", path: "/diseases" },
        { icon: "🏥", label: "Find Hospitals", path: "/hospitals" },
        { icon: "📢", label: "Notices", path: "/notices" },
    ];

    const doctorItems = [
        { icon: "🏠", label: "Dashboard", path: "/doctor-dashboard" },
        // Add more doctor specific routes here if needed
    ];

    const navItems = currentUser?.role === 'doctor' ? doctorItems : patientItems;

    return (
        <>
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
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

                <nav className="flex-1 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            active={currentPath === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    ))}
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
        </>
    );
}
