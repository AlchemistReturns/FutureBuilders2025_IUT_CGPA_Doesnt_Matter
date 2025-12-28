import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <main className="flex-1 overflow-y-auto w-full relative">
                {/* Mobile Header Toggle - Visible only on mobile */}
                <div className="md:hidden p-4 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-30">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <span className="text-2xl">☰</span>
                    </button>
                    <span className="font-bold text-lg text-gray-800">HealthX</span>
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        {currentUser?.name?.[0] || "U"}
                    </div>
                </div>

                {/* Page Content */}
                <Outlet />
            </main>
        </div>
    );
}
