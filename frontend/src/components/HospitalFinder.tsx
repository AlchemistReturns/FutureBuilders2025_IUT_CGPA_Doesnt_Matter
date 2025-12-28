import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Navigation, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

// 1. OFFLINE BACKUP DATA (Fallback)
const OFFLINE_HOSPITALS = [
    {
        id: 101,
        name: "Bandarban Sadar Hospital",
        address: "Bandarban Sadar",
        lat: 22.1953275,
        lon: 92.2183773,
        distance: 0,
        source: "OFFLINE",
        type: "District Hospital"
    },
    {
        id: 102,
        name: "Rangamati General Hospital",
        address: "Hospital Road, Rangamati",
        lat: 22.6533013,
        lon: 92.1714545,
        distance: 0,
        source: "OFFLINE",
        type: "General Hospital"
    },
    {
        id: 103,
        name: "Khagrachari District Hospital",
        address: "Khagrachari Sadar",
        lat: 23.1118675,
        lon: 91.9708914,
        distance: 0,
        source: "OFFLINE",
        type: "District Hospital"
    },
    {
        id: 104,
        name: "Chittagong Medical College",
        address: "KB Fazlul Kader Rd, Chattogram",
        lat: 22.3585785,
        lon: 91.8214373,
        distance: 0,
        source: "OFFLINE",
        type: "Medical College"
    }
];

// Helper for offline math
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const HospitalFinder: React.FC = () => {
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("Waiting for location...");
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [searchQuery, setSearchQuery] = useState("");

    const searchLocation = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setStatus("Searching location...");

        try {
            // Geocoding via Nominatim
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (geoData && geoData.length > 0) {
                const { lat, lon } = geoData[0];
                setStatus(`Found: ${geoData[0].display_name}`);

                // Fetch hospitals with new coords
                const response = await fetch(`http://localhost:5000/api/hospitals?lat=${lat}&lon=${lon}`);
                const result = await response.json();

                if (result.success && result.data.length > 0) {
                    setHospitals(result.data);
                    setIsOnline(true);
                } else {
                    setStatus("No hospitals found near this location.");
                    setHospitals([]);
                }
            } else {
                setStatus("Location not found.");
            }
        } catch (err: any) {
            console.error(err);
            setStatus("Search failed.");
        }
        setLoading(false);
    };

    const findHospitals = () => {
        setLoading(true);
        setStatus("Locating GPS...");

        if (!navigator.geolocation) {
            setStatus("GPS not supported. Using offline database.");
            setHospitals(OFFLINE_HOSPITALS);
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // 🟢 CALL YOUR BACKEND HERE
                    // Note: Ensure your backend is running on localhost:5000
                    const response = await fetch(`http://localhost:5000/api/hospitals?lat=${latitude}&lon=${longitude}`);

                    if (!response.ok) throw new Error("Backend API Failed");

                    const result = await response.json();

                    if (result.success && result.data.length > 0) {
                        setHospitals(result.data);
                        setIsOnline(true);
                        setStatus(`Location found: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    } else {
                        throw new Error("No hospitals found via API");
                    }

                } catch (error: any) {
                    console.warn("Switching to Offline Mode:", error);
                    setIsOnline(false);
                    setStatus(`API Error: ${error.message}. Showing offline data.`);

                    // Fallback Logic: Calculate distance locally for offline data
                    const sortedOffline = OFFLINE_HOSPITALS.map(h => ({
                        ...h,
                        distance: getDistance(latitude, longitude, h.lat, h.lon)
                    })).sort((a, b) => a.distance - b.distance);

                    setHospitals(sortedOffline);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Geolocation Error:", err);
                let errorMessage = "GPS Error";
                if (err.code === 1) errorMessage = "Permission Denied (Allow Location)";
                else if (err.code === 2) errorMessage = "Position Unavailable (Check GPS)";
                else if (err.code === 3) errorMessage = "Timeout (Move to open area)";

                setStatus(`${errorMessage}. Showing offline data.`);
                setHospitals(OFFLINE_HOSPITALS);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    useEffect(() => {
        findHospitals();
    }, []);

    const [mapProvider, setMapProvider] = useState<'google' | 'waze'>('google');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Reset page when hospitals change (e.g. new search)
    useEffect(() => {
        setCurrentPage(1);
    }, [hospitals]);

    // Pagination Logic
    const filteredHospitals = hospitals.filter(h => h.name !== "Unnamed Hospital");
    const totalPages = Math.ceil(filteredHospitals.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentHospitals = filteredHospitals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getNavigationUrl = (lat: number, lon: number) => {
        if (mapProvider === 'waze') {
            return `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
        }
        // Google Maps Directions (Cross-platform)
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    };

    return (
        <div className="max-w-4xl mx-auto p-4 font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <MapPin className="mr-2 text-red-600" /> Nearest Hospitals
                </h2>

                {/* Controls Container */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

                    {/* Map Provider Toggle */}
                    <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
                        <button
                            onClick={() => setMapProvider('google')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${mapProvider === 'google' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Google Maps
                        </button>
                        <button
                            onClick={() => setMapProvider('waze')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${mapProvider === 'waze' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Waze
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search area..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-red-500"
                            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                        />
                        <button
                            onClick={searchLocation}
                            className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
                        >
                            Search
                        </button>
                        <button
                            onClick={findHospitals}
                            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
                            title="Use My Location"
                        >
                            <MapPin size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            {status && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded-xl mb-6 text-sm flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertTriangle size={16} className="mr-2" /> {status}
                    </div>
                    {/* Online/Offline Badge moved here for compactness */}
                    <div className={`flex items-center px-2 py-0.5 rounded text-xs font-bold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                        {isOnline ? <Wifi size={12} className="mr-1" /> : <WifiOff size={12} className="mr-1" />}
                        {isOnline ? "Live" : "Offline"}
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2">
                {currentHospitals.map((hospital) => (
                    <div key={hospital.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-red-300 transition group">

                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-red-600 transition">
                                {hospital.name}
                            </h3>
                            <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                                {hospital.distance.toFixed(1)} km
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {hospital.type?.split(';').map((tag: string, i: number) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                            {/* Navigation Button */}
                            <a
                                href={getNavigationUrl(hospital.lat, hospital.lon)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-center font-semibold text-sm hover:bg-blue-100 transition flex items-center justify-center"
                            >
                                <Navigation size={16} className="mr-2" />
                                {mapProvider === 'waze' ? 'Waze' : 'Navigate'}
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        Previous
                    </button>
                    <span className="text-gray-600 text-sm font-semibold">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default HospitalFinder;