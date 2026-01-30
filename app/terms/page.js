"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, Zap, ArrowLeft, Heart, Scale, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

export default function TermsPage() {
    const { isDarkMode } = useTheme();

    const sections = [
        {
            icon: <Lock size={24} className="text-indigo-500" />,
            title: "Ephemeral Privacy",
            content: "All chat sessions are ephemeral. We do not store your messages once the session is terminated. Your 'vibe' is shared only with people you choose to connect with. No database logging of conversations."
        },
        {
            icon: <EyeOff size={24} className="text-rose-500" />,
            title: "Zero Tracking Identity",
            content: "No public profiles, no stalking, no history. We don't use tracking cookies. Your presence is temporary. When you go 'Invisible', you are truly gone from the network."
        },
        {
            icon: <ShieldCheck size={24} className="text-emerald-500" />,
            title: "User Conduct",
            content: "Harassment or abuse of the vibe match system will result in instant session termination. We keep the platform clean and meaningful. Respect the vibe of others."
        },
        {
            icon: <Zap size={24} className="text-amber-500" />,
            title: "Refresh Grace Period",
            content: "To prevent accidental disconnects, we offer a 5-second grace period. If you refresh within 5 seconds, your session and chat room remain intact. After that, all data is wiped."
        },
        {
            icon: <Scale size={24} className="text-purple-500" />,
            title: "Snapshot Policy",
            content: "Image snapshots are strictly auto-destructing. Attempting to bypass the 10-second timer violates our commitment to user privacy and is grounds for a permanent session ban."
        },
        {
            icon: <Shield size={24} className="text-blue-500" />,
            title: "End-to-End Vibe",
            content: "We use secure WebSocket technology to ensure your interactions are direct and minimized from third-party interception. We prioritize speed and security."
        }
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-indigo-500/30 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-rose-50/30 text-slate-800'}`}>
            <Navbar />

            {/* Background Accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-rose-500/10' : 'bg-rose-500/5'}`} />
            </div>

            <main className="max-w-4xl mx-auto px-6 py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <Link href="/" className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                        <ArrowLeft size={16} /> Exit Terms
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
                        Terms & Privacy
                    </h1>
                    <p className={`text-lg font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        Our commitment to your anonymity and the simple rules that keep the vibe alive.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-10 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 ${isDarkMode ? 'bg-[#111116] border-white/5 hover:border-white/10' : 'bg-white border-rose-100 hover:border-rose-200 shadow-xl shadow-rose-500/5'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                                {section.icon}
                            </div>
                            <h3 className="text-xl font-black mb-4 tracking-tight">{section.title}</h3>
                            <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`mt-20 p-12 rounded-[3.5rem] border text-center ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-indigo-50/30 border-indigo-100'
                        }`}
                >
                    <div className="flex justify-center gap-2 mb-6">
                        <Heart size={20} className="text-rose-500 fill-rose-500" />
                        <Sparkles size={20} className="text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-4 tracking-tight">Community Ethos</h2>
                    <p className={`max-w-xl mx-auto text-sm leading-relaxed font-medium mb-8 ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        FreeNow is built on the belief that real connections shouldn't leave a trail.
                        By using this platform, you agree to treat every interaction with authenticity and respect.
                        No logs, no traces, just vibes.
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                        Version 1.0.0 • Updated Jan 2026
                    </p>
                </motion.section>

                <footer className="mt-20 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`}>
                        &copy; {new Date().getFullYear()} FreeNow. Guaranteed Pure Identity.
                    </p>
                </footer>
            </main>
        </div>
    );
}

// Sparkles icon definition if missing from imports above
const Sparkles = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
    </svg>
);
