import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Types for Wikipedia Data
interface WikiData {
    title: string;
    extract: string;
    originalimage?: { source: string };
    content_urls?: { desktop: { page: string } };
}

// Disease Mapping for Search Queries
const diseaseMap = [
    { en: "Influenza", bn: "ইনফ্লুয়েঞ্জা" },
    { en: "COVID-19", bn: "কোভিড-১৯" },
    { en: "Migraine", bn: "মাইগ্রেন" },
    { en: "Diabetes mellitus", bn: "ডায়াবেটিস", displayEn: "Diabetes" }, // "Diabetes" might resolve to disambiguation, using specific
    { en: "Hypertension", bn: "উচ্চ রক্তচাপ" },
    { en: "Common cold", bn: "সর্দি", displayEn: "Common Cold" },
    { en: "Dengue fever", bn: "ডেঙ্গু জ্বর", displayEn: "Dengue" },
    { en: "Malaria", bn: "ম্যালেরিয়া" },
    { en: "Pneumonia", bn: "নিউমোনিয়া" },
    { en: "Tuberculosis", bn: "যক্ষ্মা" }
];

export default function DiseaseWiki() {
    const [language, setLanguage] = useState<'en' | 'bn'>('bn');
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<WikiData[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDisease, setSelectedDisease] = useState<WikiData | null>(null);

    // Fetch Data from Wikipedia
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const promises = diseaseMap.map(async (d) => {
                const query = language === 'en' ? d.en : d.bn;
                try {
                    const res = await fetch(`https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
                    if (res.ok) {
                        return await res.json();
                    }
                } catch (error) {
                    console.error(`Failed to fetch ${query}`, error);
                }
                return null;
            });

            const results = await Promise.all(promises);
            setData(results.filter(item => item !== null));
            setLoading(false);
        };

        fetchData();
    }, [language]); // Refetch when language changes

    // Filter Logic
    const filteredDiseases = data.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        {language === 'en' ? "Medical Encyclopedia" : "চিকিৎসা বিশ্বকোষ"}
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        {language === 'en' ? "Accurate, trusted information directly from Wikipedia." : "জনপ্রিয় চিকিৎসা সংক্রান্ত তথ্য, বাংলা ও ইংরেজিতে।"}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setLanguage(prev => prev === 'en' ? 'bn' : 'en')}
                        className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <span>🌐</span>
                        {language === 'en' ? "বাংলায় দেখুন" : "Switch to English"}
                    </button>
                    <Link to="/dashboard" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium shadowHover hover:bg-gray-800 transition">
                        {language === 'en' ? "← Dashboard" : "← ড্যাশবোর্ড"}
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-12 max-w-2xl mx-auto">
                <input
                    type="text"
                    placeholder={language === 'en' ? "Search for a disease..." : "রোগ অনুসন্ধান করুন..."}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 shadow-xl shadow-blue-500/5 transition text-lg bg-white/80 backdrop-blur"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-2xl">🔍</span>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">{language === 'en' ? "Loading medical data..." : "তথ্য লোড হচ্ছে..."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDiseases.map((d, idx) => (
                        <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col h-full">

                            {d.originalimage && (
                                <div className="h-48 mb-6 rounded-2xl overflow-hidden bg-gray-50">
                                    <img
                                        src={d.originalimage.source}
                                        alt={d.title}
                                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                    />
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{d.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                {d.extract}
                            </p>

                            <div className="mt-auto">
                                <button
                                    onClick={() => setSelectedDisease(d)}
                                    className="w-full py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition"
                                >
                                    {language === 'en' ? "Read full article" : "বিস্তারিত পড়ুন"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredDiseases.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">🤔</div>
                    <p className="text-xl">
                        {language === 'en'
                            ? `No results for "${searchTerm}"`
                            : `"${searchTerm}" এর জন্য কোনো ফলাফল পাওয়া যায়নি`}
                    </p>
                </div>
            )}

            {/* Modal */}
            {selectedDisease && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDisease(null)}>
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>

                        <button
                            onClick={() => setSelectedDisease(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                        >
                            ✕
                        </button>

                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedDisease.title}</h2>

                        {selectedDisease.originalimage && (
                            <img
                                src={selectedDisease.originalimage.source}
                                alt={selectedDisease.title}
                                className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm"
                            />
                        )}

                        <p className="text-gray-600 leading-loose text-lg mb-8 whitespace-pre-line">
                            {selectedDisease.extract}
                        </p>

                        <div className="flex gap-4">
                            <a
                                href={selectedDisease.content_urls?.desktop.page}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-black text-white text-center py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                            >
                                {language === 'en' ? "Read on Wikipedia" : "উইকিপিডিয়াতে পড়ুন"}
                            </a>
                            <button
                                onClick={() => setSelectedDisease(null)}
                                className="px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition"
                            >
                                {language === 'en' ? "Close" : "বন্ধ করুন"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}