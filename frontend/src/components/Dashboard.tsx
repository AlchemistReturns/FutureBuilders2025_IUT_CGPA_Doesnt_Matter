import React from "react";
import { useAuth } from "../context/AuthContext";

import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white p-6 rounded shadow-md text-center">
                <p className="mb-4">Welcome, {currentUser?.email}</p>
                <div className="flex flex-col gap-3"> {/* Added a container for spacing */}
                    <button
                        onClick={() => navigate('/ai-doctor')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Go to Doctor
                    </button>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
