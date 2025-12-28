import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-8">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        HealthX
                    </div>
                    <div className="hidden md:flex gap-6">
                        <Link to="/diseases" className="text-gray-600 hover:text-blue-600 font-medium transition">Encyclopedia</Link>
                        <Link to="/notices" className="text-gray-600 hover:text-blue-600 font-medium transition">Notices</Link>
                    </div>
                </div>
                <div className="space-x-4">
                    {currentUser ? (
                        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-blue-100 text-blue-600 font-semibold rounded-full hover:bg-blue-200 transition">
                            Dashboard
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900 transition">Log In</Link>
                            <Link to="/register" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-10 md:mt-20 mb-20">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-wide uppercase animate-fade-in">
                    🚀 The Future of Healthcare
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl animate-fade-in">
                    Your Personal <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">AI Doctor</span> <br />
                    Available 24/7.
                </h1>

                <p className="text-xl text-gray-500 max-w-2xl mb-10 animate-fade-in">
                    Get instant medical guidance, track symptoms, and manage your health records with our advanced AI-powered assistant. Secure, private, and always on.
                </p>

                <div className="flex gap-4 animate-fade-in">
                    <Link to={currentUser ? "/dashboard" : "/register"} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:scale-105 transition transform shadow-xl hover:shadow-2xl flex items-center gap-2">
                        Start Consultation
                        <span className="text-xl">→</span>
                    </Link>
                    <a href="#features" className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition shadow-sm hover:shadow-md">
                        Learn More
                    </a>
                </div>

                {/* Hero Image / Graphic */}
                <div className="mt-20 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-white p-2 animate-fade-in relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white/50 pointer-events-none"></div>
                    <img
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Dashboard Preview"
                        className="rounded-2xl w-full h-auto object-cover opacity-90"
                    />
                </div>
            </main>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Why Choose HealthX?</h2>
                        <p className="text-gray-500 mt-2">Everything you need to manage your health in one place.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: "🤖", title: "AI Consultation", desc: "Advanced Gemini-powered analysis for your symptoms." },
                            { icon: "📉", title: "Symptom Tracking", desc: "Monitor your health progress over time with smart charts." },
                            { icon: "🔒", title: "Privacy First", desc: "Your medical data is encrypted and secure." },
                            { icon: "⚡", title: "Instant Answers", desc: "No waiting rooms. Get guidance in seconds." },
                            { icon: "📂", title: "Offine Mode", desc: "Access your chat history and limited AI even without internet." },
                            { icon: "📚", title: "Health Wiki", desc: "Comprehensive encyclopedia of diseases and conditions." }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-3xl bg-gray-50 hover:bg-blue-50 transition border border-transparent hover:border-blue-100 group">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition transform">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-500">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 text-center">
                <p>&copy; 2024 HealthX. All rights reserved.</p>
            </footer>
        </div>
    );
}
