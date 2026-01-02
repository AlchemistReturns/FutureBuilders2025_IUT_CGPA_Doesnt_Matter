import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/api';

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "Male",
        email: "",
        password: "",
        confirmPassword: "",
        role: "patient",
        specialty: "",
        experience: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to register");
            }

            const data = await response.json();
            login(data.token, { uid: data.userId, email: data.email, name: data.name, role: data.role as any });

            // Redirect based on role
            if (data.role === 'doctor') {
                navigate("/doctor-dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in">

                {/* Left Side: Visual */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-emerald-600 to-teal-800 p-12 flex-col justify-between text-white relative overflow-hidden order-last md:order-first">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500 opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500 opacity-20 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="text-5xl mb-4">🚀</div>
                        <h2 className="text-3xl font-bold mb-4">Start Your Health Journey</h2>
                        <p className="text-emerald-100 text-lg leading-relaxed">
                            Join thousands of users who trust our AI to provide accurate, timely health insights.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                            <span className="text-xl">🔒</span>
                            <span className="text-sm font-medium">Secure & Private Data</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                            <span className="text-xl">⚡</span>
                            <span className="text-sm font-medium">24/7 AI Availability</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                    <div className="mb-6 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                        <p className="text-gray-500 text-sm">
                            Fill in your details to get started.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">

                        {/* Role Selection */}
                        <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'patient' })}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${formData.role === 'patient' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${formData.role === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                Doctor
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Full Name</label>
                                <input name="name" type="text" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-gray-50" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Age</label>
                                <input name="age" type="number" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-gray-50" placeholder="25" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Gender</label>
                            <select name="gender" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-gray-50">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Doctor Specific Fields */}
                        {formData.role === 'doctor' && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Specialty</label>
                                    <input name="specialty" type="text" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-blue-50" placeholder="Cardiologist" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Experience (Yrs)</label>
                                    <input name="experience" type="text" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-blue-50" placeholder="5 Years" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Email</label>
                            <input name="email" type="email" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-gray-50" placeholder="john@example.com" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Password</label>
                                <input name="password" type="password" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-gray-50" placeholder="••••••" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Confirm</label>
                                <input name="confirmPassword" type="password" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-gray-50" placeholder="••••••" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-6 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-70 ${formData.role === 'doctor' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}
                        >
                            {loading ? "Creating Account..." : `Register as ${formData.role === 'doctor' ? 'Doctor' : 'Patient'}`}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
