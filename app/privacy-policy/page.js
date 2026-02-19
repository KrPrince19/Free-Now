"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, ArrowLeft, MessageSquare, Globe, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

export default function PrivacyPolicyPage() {
    const { isDarkMode } = useTheme();

    const sections = [
        {
            icon: <Database size={24} className="text-indigo-500" />,
            title: "Data Collection",
            content: "We collect minimal information required to provide our networking services: your email address, name, and temporary session identifiers. We do not collect or store sensitive personal information like biometrics or precise location data."
        },
        {
            icon: <Eye size={24} className="text-indigo-500" />,
            title: "Use of Information",
            content: "Your data is used exclusively for account authentication, delivering our digital services, and platform security. We do not sell, trade, or rent your personal information to third parties for marketing purposes."
        },
        {
            icon: <Lock size={24} className="text-emerald-500" />,
            title: "Data Retention",
            content: "Consistent with our 'Pure Identity' philosophy, communication data is ephemeral. Chat messages and media snapshots are not logged in our permanent databases and are purged immediately upon session termination."
        },
        {
            icon: <Globe size={24} className="text-amber-500" />,
            title: "Cookies & Tracking",
            content: "FreeNow uses only essential functional cookies required for session maintenance. We do not employ tracking pixels, third-party advertising cookies, or behavior-monitoring scripts."
        }
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-indigo-500/30 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-slate-50/30 text-slate-800'}`}>
            <Navbar />

            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`} />
            </div>

            <main className="max-w-4xl mx-auto px-6 py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <Link href="/terms" className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                        <ArrowLeft size={16} /> Back to Terms
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                    <p className={`text-lg font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        How we protect your data in the digital networking era.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-10 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 ${isDarkMode ? 'bg-[#111116] border-white/5 hover:border-white/10' : 'bg-white border-rose-100 shadow-xl shadow-rose-500/5'}`}
                        >
                            <div className="flex items-center gap-6 mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                                    {section.icon}
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">{section.title}</h3>
                            </div>
                            <p className={`text-md leading-relaxed font-medium ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`mt-20 p-12 rounded-[3.5rem] border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-indigo-50/30 border-indigo-100'}`}
                >
                    <h2 className="text-2xl font-black mb-6 tracking-tight flex items-center gap-3">
                        <Shield className="text-indigo-500" size={24} />
                        Compliance & Rights
                    </h2>
                    <div className={`space-y-4 text-sm font-medium ${isDarkMode ? 'text-white/40' : 'text-slate-600'}`}>
                        <p>Under the Information Technology Act, 2000 and subsequent rules, users have the right to access, correct, or delete their personal data. For any privacy-related inquiries, please contact our grievance officer via the Support page.</p>
                        <p>We implement industry-standard security measures including encryption and secure socket layers (SSL) to protect data during transmission and storage.</p>
                    </div>
                </motion.section>

                <footer className="mt-20 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`}>
                        Effective Date: January 01, 2026 | &copy; FreeNow
                    </p>
                </footer>
            </main>
        </div>
    );
}
