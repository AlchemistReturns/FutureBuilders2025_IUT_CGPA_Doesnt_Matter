import React, { useState } from 'react';
import { Bell, Calendar, Languages, Megaphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- 1. BRUTE FORCE DATA (Hardcoded Notices) ---
const NOTICE_DATA = [
    {
        id: 1,
        date: "2025-12-28",
        category: "Vaccination",
        title: { en: "Polio Vaccination Campaign Starts Next Week", bn: "আগামী সপ্তাহে পোলিও টিকাদান কর্মসূচি শুরু" },
        content: {
            en: "The national polio vaccination drive will run from Jan 1st to Jan 7th. All children under 5 must be vaccinated at local clinics.",
            bn: "জাতীয় পোলিও টিকাদান কর্মসূচি ১লা জানুয়ারি থেকে ৭ই জানুয়ারি পর্যন্ত চলবে। ৫ বছরের কম বয়সী সকল শিশুকে স্থানীয় ক্লিনিকে টিকা দিতে হবে।"
        }
    },
    {
        id: 2,
        date: "2025-12-25",
        category: "Alert",
        title: { en: "Winter Cold Wave Warning", bn: "শীতকালীন শৈত্যপ্রবাহের সতর্কতা" },
        content: {
            en: "Severe cold wave expected in northern districts. Please keep children and elderly warm. Drink warm water.",
            bn: "উত্তরাঞ্চলে তীব্র শৈত্যপ্রবাহের সম্ভাবনা। শিশু ও বৃদ্ধদের গরম রাখুন। কুসুম গরম পানি পান করুন।"
        }
    },
    {
        id: 3,
        date: "2025-12-20",
        category: "Discovery",
        title: { en: "New Dengue Prevention Method", bn: "ডেঙ্গু প্রতিরোধের নতুন পদ্ধতি" },
        content: {
            en: "Researchers suggest using mosquito nets even during the day. Clean stagnant water around your home every Friday.",
            bn: "গবেষকরা দিনের বেলাতেও মশারি ব্যবহারের পরামর্শ দিচ্ছেন। প্রতি শুক্রবার আপনার বাড়ির চারপাশের জমে থাকা পানি পরিষ্কার করুন।"
        }
    },
    {
        id: 4,
        date: "2025-12-15",
        category: "General",
        title: { en: "Free Eye Camp on Sunday", bn: "রবিবার বিনামূল্যে চক্ষু শিবির" },
        content: {
            en: "A team of doctors from Dhaka will provide free eye checkups at the Upazila Health Complex from 9 AM to 4 PM.",
            bn: "ঢাকা থেকে আগত ডাক্তারদের একটি দল সকাল ৯টা থেকে বিকাল ৪টা পর্যন্ত উপজেলা স্বাস্থ্য কমপ্লেক্সে বিনামূল্যে চক্ষু পরীক্ষা করবেন।"
        }
    }
];

const NoticeBoard: React.FC = () => {
    const navigate = useNavigate();
    // State for Language (Default to Bangla 'bn')
    const [lang, setLang] = useState<'en' | 'bn'>('bn');

    return (
        <div className="max-w-4xl mx-auto p-4 font-sans">

            {/* Header Section */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Megaphone className="text-orange-500 mr-2" size={24} />
                        {lang === 'en' ? "Health Notices" : "স্বাস্থ্য বিজ্ঞপ্তি"}
                    </h2>
                </div>

                {/* Language Toggle */}
                <button
                    onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                    className="flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-200 hover:bg-orange-100 transition"
                >
                    <Languages size={16} className="mr-2" />
                    {lang === 'en' ? "বাংলা" : "ENGLISH"}
                </button>
            </div>

            {/* Notice List */}
            <div className="space-y-4">
                {NOTICE_DATA.map((notice) => (
                    <div key={notice.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

                        {/* Top Row: Date & Category */}
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                ${notice.category === 'Vaccination' ? 'bg-blue-100 text-blue-700' :
                                    notice.category === 'Alert' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                {notice.category}
                            </span>
                            <div className="flex items-center text-gray-400 text-xs">
                                <Calendar size={14} className="mr-1" />
                                {notice.date}
                            </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {lang === 'en' ? notice.title.en : notice.title.bn}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            {lang === 'en' ? notice.content.en : notice.content.bn}
                        </p>

                        {/* "New" Badge for recent items (Brute force logic: if id is 1) */}
                        {notice.id === 1 && (
                            <div className="mt-4 flex items-center text-orange-600 text-xs font-bold animate-pulse">
                                <Bell size={14} className="mr-1" />
                                {lang === 'en' ? "Latest Update" : "সর্বশেষ আপডেট"}
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
};

export default NoticeBoard;