"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, Zap, ArrowLeft, Heart, Scale, ShieldCheck, MessageSquare, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

export default function TermsPage() {
    const { isDarkMode } = useTheme();

    const sections = [
        {
            icon: <Lock size={24} className="text-indigo-500" />,
            title: "Service Overview",
            content: "FreeNow provides real-time digital networking and content transmission services. Our platform enables users to establish temporary, encrypted communication channels. We operate on a 'Zero-Persistence' model, ensuring that user-generated content is not retained on our servers after session conclusion."
        },
        {
            icon: <EyeOff size={24} className="text-indigo-500" />,
            title: "Identity & Anonymity",
            content: "We prioritize user privacy by minimizing data collection. The platform does not maintain public user directories or historical tracking. User presence is managed through temporary session tokens that expire upon inactivity or manual termination."
        },
        {
            icon: <ShieldCheck size={24} className="text-emerald-500" />,
            title: "Acceptable Use Policy",
            content: "Users must adhere to our Community Standards. Any form of harassment, unauthorized data scraping, or abuse of the networking system is strictly prohibited. Violations result in immediate suspension of service access to protect the platform's integrity."
        },
        {
            icon: <Zap size={24} className="text-amber-500" />,
            title: "Technical Continuity",
            content: "Our infrastructure includes a 5-second session recovery window to mitigate accidental network disconnections. Beyond this window, all session-related metadata is automatically purged from active memory for security compliance."
        },
        {
            icon: <Scale size={24} className="text-purple-500" />,
            title: "Intellectual Property",
            content: "Users retain ownership of the content they transmit. However, by using the service, you grant FreeNow a temporary license to relay such content to the intended recipient. All platform logos, software, and designs are the exclusive property of FreeNow."
        },
        {
            icon: <Shield size={24} className="text-blue-500" />,
            title: "Security & Encryption",
            content: "We utilize industry-standard WebSocket protocols and SSL/TLS encryption for all data in transit. Our architecture is designed to minimize third-party intercepted risks and ensure high-speed, secure data delivery."
        }
    ];

    const faqs = [
        {
            q: "What is the ICE Protocol?",
            a: "The 'Instant Closure Entry' protocol is our automated safety response system. If our administrative monitors or automated filters detect severe violations of our Service Agreement, the associated account is instantly restricted via a secure overlay to prevent further platform interaction."
        },
        {
            q: "What is the policy on account termination?",
            a: "FreeNow supports 'Complete Data Erasure'. Upon user request or administrative termination, we perform a cascading database purge that removes all profile references and system activity logs, ensuring no residual data remains."
        },
        {
            q: "How are account statistics managed?",
            a: "Users may request a reset of their networking metrics (total requests and matches). This action clears historical usage data while maintaining the registered account identity, allowing for a recalibrated user experience."
        },
        {
            q: "Are there usage quotas on the platform?",
            a: "To maintain optimal service performance and prevent system overflow, daily usage limits are applied to all accounts. These quotas (5 chat requests and 3 status updates) are reset daily at 00:00 IST."
        },

        {
            q: "Is my personal data protected?",
            a: "Yes. We maintain a 'Privacy by Design' architecture. Administrative access is restricted to account metadata and status management only. Private communications and ephemeral media are never logged or accessible by platform staff."
        }
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-indigo-500/30 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-rose-50/30 text-slate-800'}`}>
            <Navbar />

            {/* Background Accents */}
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
                    <Link href="/" className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                        <ArrowLeft size={16} /> Exit Terms
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                        Terms of Service
                    </h1>
                    <p className={`text-lg font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        Professional standards for global digital networking.
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

                <div className="mt-12 flex flex-wrap justify-center gap-4">
                    <Link href="/privacy-policy" className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>Privacy Policy</Link>

                    <Link href="/contact" className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>Contact Us</Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-24 mb-12"
                >
                    <h2 className="text-3xl font-black tracking-tight mb-8 px-4 flex items-center gap-3">
                        <Scale className="text-indigo-500" size={24} />
                        Compliance & FAQ
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className={`p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/[0.01] border-white/[0.03] hover:border-white/10' : 'bg-slate-50 border-slate-100'
                                    }`}
                            >
                                <h4 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-2">Notice</h4>
                                <p className="text-lg font-bold mb-4 tracking-tight">{faq.q}</p>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Policy Detail</h4>
                                <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`mt-20 p-12 rounded-[3.5rem] border text-center ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-indigo-50/30 border-indigo-100'
                        }`}
                >
                    <div className="flex justify-center gap-2 mb-6">
                        <MessageSquare size={20} className="text-indigo-500" />
                        <Sparkles size={20} className="text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-4 tracking-tight">Community Ethos</h2>
                    <p className={`max-w-xl mx-auto text-sm leading-relaxed font-medium mb-8 ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        FreeNow is built on the belief that real networking doesn't require permanent traces.
                        By using this platform, you agree to treat every interaction with professional respect and authenticity.
                        No logs, no traces, just syncs.
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

