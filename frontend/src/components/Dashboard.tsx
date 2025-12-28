import React from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white p-6 rounded shadow-md text-center">
                <p className="mb-4">Welcome, {currentUser?.email}</p>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
