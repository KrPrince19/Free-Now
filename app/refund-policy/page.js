"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCcw, Ban, CheckCircle, Clock, ArrowLeft, ShieldAlert, CreditCard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

export default function RefundPolicyPage() {
    const { isDarkMode } = useTheme();

    const sections = [
        {
            icon: <CreditCard size={24} className="text-indigo-500" />,
            title: "Digital Services & Goods",
            content: "FreeNow provides digital networking services and premium status upgrades (Elite Status). As these are intangible, digital products that are instantly delivered upon successful payment, they are generally non-refundable."
        },
        {
            icon: <Clock size={24} className="text-indigo-500" />,
            title: "Cancellation Policy",
            content: "Users may cancel their Elite subscription at any time through their profile settings. Once cancelled, you will continue to have access to premium features until the end of your current 30-day billing cycle. No further charges will be made."
        },
        {
            icon: <ShieldAlert size={24} className="text-emerald-500" />,
            title: "Refund Exception Criteria",
            content: "Refunds may be considered in cases of technical failure where service was not delivered despite successful payment, or in cases of unauthorized transactions. Refund requests must be submitted via the Support page within 48 hours of the transaction."
        },
        {
            icon: <RefreshCcw size={24} className="text-amber-500" />,
            title: "Refund Processing",
            content: "Approved refunds are processed within 5-7 business days and will be credited back to the original payment method used during the transaction (Bank Account, Credit/Debit Card, or UPI)."
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
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                        Refund Policy
                    </h1>
                    <p className={`text-lg font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        Clear, transparent guidelines on cancellations and refunds.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-10 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 ${isDarkMode ? 'bg-[#111116] border-white/5 hover:border-white/10' : 'bg-white border-rose-100 hover:border-rose-200 shadow-xl shadow-rose-500/5'}`}
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

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`mt-12 p-8 rounded-3xl border text-center ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}
                >
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/30' : 'text-slate-500'}`}>
                        By completing a purchase on FreeNow, you acknowledge that you have read and agree to our Refund and Cancellation Policy.
                    </p>
                </motion.div>

                <footer className="mt-20 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`}>
                        Updated: January 2026 | &copy; FreeNow
                    </p>
                </footer>
            </main>
        </div>
    );
}
