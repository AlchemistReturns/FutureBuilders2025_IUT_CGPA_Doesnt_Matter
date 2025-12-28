import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Welcome to HealthX</h1>
            <div className="space-x-4">
                <Link to="/login" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
                    Login
                </Link>
                <Link to="/register" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition">
                    Register
                </Link>
            </div>
        </div>
    );
};

export default Home;
