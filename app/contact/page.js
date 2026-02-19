"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, ArrowLeft, Send, CheckCircle2, Zap, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

export default function ContactPage() {
    const { isDarkMode } = useTheme();
    const [formState, setFormState] = useState('idle'); // idle, sending, success
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormState('sending');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setFormState('success');
                setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                setTimeout(() => setFormState('idle'), 3000);
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            setFormState('idle');
        }
    };

    const contactMethods = [
        {
            icon: <Mail size={24} className="text-indigo-500" />,
            title: "Email Support",
            detail: "support@freenow.club",
            desc: "Response within 24-48 hours"
        },
        {
            icon: <MessageSquare size={24} className="text-rose-500" />,
            title: "Admin Pulse",
            detail: "Live Support Form",
            desc: "For registered users only"
        },
        {
            icon: <Clock size={24} className="text-emerald-500" />,
            title: "Business Hours",
            detail: "9:00 AM - 6:00 PM IST",
            desc: "Monday to Friday"
        }
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-indigo-500/30 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-rose-50/30 text-slate-800'}`}>
            <Navbar />

            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-rose-500/10' : 'bg-rose-500/5'}`} />
            </div>

            <main className="max-w-6xl mx-auto px-6 py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <Link href="/" className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                        <ArrowLeft size={16} /> Close Contact
                    </Link>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
                        Contact Us
                    </h1>
                    <p className={`text-xl font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        Reach out to the FreeNow team for support, business inquiries, or technical assistance.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {contactMethods.map((method, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-8 rounded-3xl border backdrop-blur-xl transition-all ${isDarkMode ? 'bg-white/[0.03] border-white/5 hover:border-white/10' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                                    {method.icon}
                                </div>
                                <h3 className="text-xl font-black mb-1">{method.title}</h3>
                                <p className="text-indigo-500 font-bold mb-2">{method.detail}</p>
                                <p className={`text-xs font-medium ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>{method.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-10 md:p-12 rounded-[3.5rem] border backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-rose-100 shadow-2xl shadow-rose-500/5'}`}
                        >
                            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full px-8 py-5 rounded-2xl outline-none font-bold border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 focus:border-indigo-500/50 text-white' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-200 text-slate-800'}`}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full px-8 py-5 rounded-2xl outline-none font-bold border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 focus:border-indigo-500/50 text-white' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-200 text-slate-800'}`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className={`w-full px-8 py-5 rounded-2xl outline-none font-bold border appearance-none transition-all ${isDarkMode ? 'bg-white/5 border-white/5 focus:border-indigo-500/50 text-white' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-200 text-slate-800'}`}
                                    >
                                        <option>General Inquiry</option>
                                        <option>Technical Support</option>

                                        <option>Business Cooperation</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Message</label>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="Enter your message here..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className={`w-full px-8 py-6 rounded-[2rem] outline-none font-bold border resize-none transition-all ${isDarkMode ? 'bg-white/5 border-white/5 focus:border-indigo-500/50 text-white' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-200 text-slate-800'}`}
                                    />
                                </div>

                                <button
                                    disabled={formState !== 'idle'}
                                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${formState === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-2xl shadow-indigo-500/20'}`}
                                >
                                    {formState === 'idle' && <>Send Inquiry <Send size={18} /></>}
                                    {formState === 'sending' && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Zap size={20} /></motion.div>}
                                    {formState === 'success' && <>Message Sent <CheckCircle2 size={18} /></>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>

                <footer className="mt-24 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`}>
                        FreeNow Support Hub | &copy; {new Date().getFullYear()}
                    </p>
                </footer>
            </main>
        </div>
    );
}
