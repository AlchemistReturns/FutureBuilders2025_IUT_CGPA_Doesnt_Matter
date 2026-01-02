import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, MapPin, Star, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/api';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    experience: string;
    gender: string;
}

export default function DoctorList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { currentUser } = useAuth();

    // Booking Modal State
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [bookingReason, setBookingReason] = useState("");
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/doctors`);
                const data = await response.json();
                if (data.success) {
                    setDoctors(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch doctors", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctor || !currentUser) return;

        setBookingStatus("loading");
        setErrorMessage("");

        const payload = {
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            patientId: currentUser.uid,
            patientName: currentUser.email?.split('@')[0],
            date: bookingDate,
            time: bookingTime,
            reason: bookingReason
        };
        console.log("Sending appointment request:", payload);

        try {
            const response = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setBookingStatus("success");
                setTimeout(() => {
                    setSelectedDoctor(null);
                    setBookingStatus("idle");
                    setBookingDate("");
                    setBookingTime("");
                    setBookingReason("");
                }, 2000);
            } else {
                console.error("Booking failed:", data);
                setBookingStatus("error");
                setErrorMessage(data.error || "Failed to book appointment");
            }
        } catch (error: any) {
            console.error("Network error during booking:", error);
            setBookingStatus("error");
            setErrorMessage(error.message || "Network error");
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans min-h-screen relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
                    <p className="text-gray-500">Connect with top specialists for your health needs.</p>
                </div>
                <Link to="/dashboard" className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition text-gray-700">
                    Back to Dashboard
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or specialty..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w - 16 h - 16 rounded - full flex items - center justify - center text - 2xl font - bold text - white shadow - md ${doctor.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'} `}>
                                    {doctor.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">{doctor.name}</h3>
                                    <div className="text-blue-600 font-medium text-sm bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
                                        {doctor.specialty}
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1 flex items-center">

                                        {doctor.experience} Years of Experience.
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex gap-2">
                                <button
                                    onClick={() => setSelectedDoctor(doctor)}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}

                    {doctors.length === 0 && !loading && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No doctors found. Be the first to join!
                        </div>
                    )}
                </div>
            )}

            {/* Booking Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
                        <button
                            onClick={() => setSelectedDoctor(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                            <p className="text-gray-500">with Dr. {selectedDoctor.name}</p>
                        </div>

                        {bookingStatus === 'success' ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">🎉</div>
                                <h3 className="text-xl font-bold text-emerald-600 mb-2">Request Sent!</h3>
                                <p className="text-gray-500">Your appointment request has been sent successfully.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleBookAppointment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={bookingDate}
                                        onChange={e => setBookingDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={bookingTime}
                                        onChange={e => setBookingTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Briefly describe your symptoms..."
                                        value={bookingReason}
                                        onChange={e => setBookingReason(e.target.value)}
                                    ></textarea>
                                </div>

                                {bookingStatus === 'error' && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center mb-4">
                                        ⚠️ {errorMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={bookingStatus === 'loading'}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-70"
                                >
                                    {bookingStatus === 'loading' ? 'Sending...' : 'Confirm Booking'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
