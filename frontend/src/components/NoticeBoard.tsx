import { useState } from "react";
import { Link } from "react-router-dom";

type NoticeType = 'Alert' | 'Update' | 'Info';

interface Notice {
    id: number;
    type: NoticeType;
    date: { en: string; bn: string };
    title: { en: string; bn: string };
    content: { en: string; bn: string };
}

const notices: Notice[] = [
    {
        id: 1,
        type: "Alert",
        date: { en: "Dec 28, 2024", bn: "২৮ ডিসেম্বর, ২০২৪" },
        title: { en: "Flu Season Warning", bn: "ফ্লু মৌসুমের সতর্কতা" },
        content: {
            en: "Influenza cases are rising. Please get vaccinated if you haven't already.",
            bn: "ইনফ্লুয়েঞ্জা কেস বাড়ছে। আপনি যদি এখনও টিকা না নিয়ে থাকেন তবে অনুগ্রহ করে নিন।"
        }
    },
    {
        id: 2,
        type: "Update",
        date: { en: "Dec 25, 2024", bn: "২৫ ডিসেম্বর, ২০২৪" },
        title: { en: "New AI Features", bn: "নতুন এআই বৈশিষ্ট্য" },
        content: {
            en: "We have upgraded our AI Doctor to Gemini 1.5 Flash for faster responses.",
            bn: "আমরা আমাদের এআই ডাক্তারকে জেমিনি ১.৫ ফ্ল্যাশে আপগ্রেড করেছি দ্রুত প্রতিক্রিয়ার জন্য।"
        }
    },
    {
        id: 3,
        type: "Info",
        date: { en: "Dec 30, 2024", bn: "৩০ ডিসেম্বর, ২০২৪" },
        title: { en: "Maintenance Scheduled", bn: "রক্ষণাবেক্ষণ নির্ধারিত" },
        content: {
            en: "Server maintenance scheduled for 2 AM - 4 AM UTC.",
            bn: "সার্ভার রক্ষণাবেক্ষণ ভোর ২টা - ৪টা ইউটিসি পর্যন্ত নির্ধারিত।"
        }
    },
];

export default function NoticeBoard() {
    const [language, setLanguage] = useState<'en' | 'bn'>('en');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {language === 'en' ? "Health Notices" : "স্বাস্থ্য বিজ্ঞপ্তি"}
                    </h1>
                    <p className="text-gray-500">
                        {language === 'en' ? "Stay updated with the latest alerts and news." : "সর্বশেষ সতর্কতা এবং খবরের সাথে আপডেট থাকুন।"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setLanguage(prev => prev === 'en' ? 'bn' : 'en')}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm flex items-center gap-2"
                    >
                        <span>🌐</span>
                        {language === 'en' ? "বাংলায় দেখুন" : "Switch to English"}
                    </button>
                    <Link to="/dashboard" className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition text-sm font-medium">
                        {language === 'en' ? "Back to Dashboard" : "ড্যাশবোর্ডে ফিরে যান"}
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                {notices.map((notice) => (
                    <div key={notice.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition">
                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold
                            ${notice.type === 'Alert' ? 'bg-red-100 text-red-600' :
                                notice.type === 'Update' ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                            }
                        `}>
                            {notice.type === 'Alert' ? '!' : notice.type === 'Update' ? '★' : 'i'}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {language === 'en' ? notice.title.en : notice.title.bn}
                                </h3>
                                <span className="text-xs text-gray-400">
                                    {language === 'en' ? notice.date.en : notice.date.bn}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {language === 'en' ? notice.content.en : notice.content.bn}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}