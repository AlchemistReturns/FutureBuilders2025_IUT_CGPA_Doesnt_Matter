import React, { useState, useEffect } from 'react';
import { Search, X, Languages, Activity, ExternalLink, ChevronRight, AlertCircle } from 'lucide-react';

// --- 1. DATA CONFIGURATION ---
// You can add more diseases here. Ensure names match Wikipedia titles exactly.
const DISEASE_DATA = [
    { en: "Malaria", bn: "ম্যালেরিয়া" },
    { en: "Dengue fever", bn: "ডেঙ্গু জ্বর" },
    { en: "Cholera", bn: "কলেরা" },
    { en: "Typhoid fever", bn: "টাইফয়েড জ্বর" },
    { en: "Tuberculosis", bn: "যক্ষ্মা" },
    { en: "Pneumonia", bn: "নিউমোনিয়া" },
    { en: "Rabies", bn: "জলাতঙ্ক" },
    { en: "Scabies", bn: "খোসপাঁচড়া" },
    { en: "Snakebite", bn: "সাপের কামড়" },
    { en: "Diarrhea", bn: "ডায়রিয়া" },
    { en: "Heat stroke", bn: "হিট স্ট্রোক" },
    { en: "Food poisoning", bn: "খাদ্যে বিষক্রিয়া" }
];

interface WikiData {
    title: string;
    extract: string;
    thumbnail?: { source: string };
    content_urls: { desktop: { page: string } };
}

const DiseaseWiki: React.FC = () => {
    // --- STATE MANAGEMENT ---
    // Language State (Persists in Local Storage)
    const [lang, setLang] = useState<'en' | 'bn'>(() =>
        (localStorage.getItem('wikiLanguage') as 'en' | 'bn') || 'bn'
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDisease, setSelectedDisease] = useState<{ en: string, bn: string } | null>(null);
    const [wikiData, setWikiData] = useState<WikiData | null>(null);
    const [loading, setLoading] = useState(false);

    // Save language preference whenever it changes
    useEffect(() => {
        localStorage.setItem('wikiLanguage', lang);
    }, [lang]);

    // --- FETCH LOGIC ---
    useEffect(() => {
        if (!selectedDisease) return;

        const fetchData = async () => {
            setLoading(true);
            const query = lang === 'en' ? selectedDisease.en : selectedDisease.bn;

            try {
                // Fetch from either en.wikipedia or bn.wikipedia based on preference
                const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);

                if (res.ok) {
                    const data = await res.json();
                    setWikiData(data);
                } else {
                    setWikiData(null);
                }
            } catch (err) {
                console.error(err);
                setWikiData(null);
            }
            setLoading(false);
        };

        fetchData();
    }, [selectedDisease, lang]);

    // --- SEARCH FILTER ---
    const filteredDiseases = DISEASE_DATA.filter(d => {
        const name = lang === 'en' ? d.en.toLowerCase() : d.bn.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="font-sans max-w-6xl mx-auto p-4">

            {/* --- TOP BAR: Header, Search & Language --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Activity className="text-blue-600 mr-2" />
                    {lang === 'en' ? "Health Info" : "স্বাস্থ্য তথ্য"}
                </h2>

                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={lang === 'en' ? "Search diseases..." : "রোগ অনুসন্ধান করুন..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm"
                    />
                </div>

                {/* Language Toggle */}
                <button
                    onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-100 transition border border-blue-100"
                >
                    <Languages size={16} className="mr-2" />
                    {lang === 'en' ? "বাংলা" : "ENGLISH"}
                </button>
            </div>

            {/* --- GRID LAYOUT (BOX FORMAT) --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDiseases.map((disease) => (
                    <div
                        key={disease.en}
                        onClick={() => setSelectedDisease(disease)}
                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 cursor-pointer transition-all flex flex-col items-center justify-center text-center group h-44"
                    >
                        <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-blue-600 transition duration-300">
                            <Activity className="text-blue-600 group-hover:text-white transition duration-300" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">
                            {lang === 'en' ? disease.en : disease.bn}
                        </h3>
                        <span className="text-xs text-gray-400 mt-2 flex items-center group-hover:text-blue-500">
                            {lang === 'en' ? "Tap details" : "বিস্তারিত"}
                            <ChevronRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition" />
                        </span>
                    </div>
                ))}

                {filteredDiseases.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        {lang === 'en' ? "No diseases found matching your search." : "আপনার অনুসন্ধানের সাথে কোন রোগ মিলছে না।"}
                    </div>
                )}
            </div>

            {/* --- POPUP MODAL (DETAILS VIEW) --- */}
            {selectedDisease && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ animation: 'fadeIn 0.2s' }}>
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col">

                        {/* Close Button */}
                        <button
                            onClick={() => { setSelectedDisease(null); setWikiData(null); }}
                            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-gray-200 rounded-full text-gray-800 transition z-10 shadow-sm"
                        >
                            <X size={24} />
                        </button>

                        {loading ? (
                            // Loading Spinner
                            <div className="h-64 flex flex-col items-center justify-center space-y-4 text-gray-400">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p>{lang === 'en' ? "Fetching from Wikipedia..." : "উইকিপিডিয়া থেকে তথ্য আনা হচ্ছে..."}</p>
                            </div>
                        ) : wikiData ? (
                            // Success Content
                            <div>
                                {/* Header Image */}
                                {wikiData.thumbnail && (
                                    <div className="w-full h-56 bg-gray-100 relative">
                                        <img
                                            src={wikiData.thumbnail.source}
                                            alt={wikiData.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <h2 className="absolute bottom-4 left-6 text-3xl font-bold text-white shadow-sm">
                                            {wikiData.title}
                                        </h2>
                                    </div>
                                )}

                                {!wikiData.thumbnail && (
                                    <div className="h-24 bg-blue-600 flex items-center px-8">
                                        <h2 className="text-3xl font-bold text-white">{wikiData.title}</h2>
                                    </div>
                                )}

                                <div className="p-6 md:p-8">
                                    {/* Disclaimer Box */}
                                    <div className="flex items-start bg-amber-50 p-4 rounded-lg mb-6 border border-amber-100">
                                        <AlertCircle className="text-amber-600 mt-0.5 mr-3 flex-shrink-0" size={18} />
                                        <p className="text-sm text-amber-800 leading-snug">
                                            {lang === 'en'
                                                ? "Medical Disclaimer: Sourced from Wikipedia. Consult a doctor for medical advice."
                                                : "সতর্কতা: তথ্যটি উইকিপিডিয়া থেকে সংগৃহীত। চিকিৎসার জন্য ডাক্তারের পরামর্শ নিন।"}
                                        </p>
                                    </div>

                                    {/* Main Text */}
                                    <p className="text-gray-700 text-lg leading-relaxed mb-8 text-justify">
                                        {wikiData.extract}
                                    </p>

                                    {/* Footer Button */}
                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <a
                                            href={wikiData.content_urls.desktop.page}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition shadow-lg"
                                        >
                                            {lang === 'en' ? "Read Full Article" : "সম্পূর্ণ পড়ুন"}
                                            <ExternalLink size={18} className="ml-2" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Error State
                            <div className="p-10 text-center text-gray-500">
                                <p>{lang === 'en' ? "Information not available." : "তথ্য পাওয়া যায়নি।"}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default DiseaseWiki;