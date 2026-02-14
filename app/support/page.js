"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle,
    MessageCircle,
    ChevronDown,
    Send,
    ArrowLeft,
    Sparkles,
    ShieldCheck,
    Zap,
    Heart,
    Mail,
    User,
    CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

const FAQS = [
    {
        question: "How does the 5-second grace period work?",
        answer: "If you accidentally refresh or lose connection, we hold your session for exactly 5 seconds. If you reconnect within this window, you'll jump right back into your conversation as if nothing happened. After 5 seconds, the vibe is wiped for security."
    },
    {
        question: "Are my messages stored on the server?",
        answer: "Absolutely not. Messages are ephemeral and only persist in your browser's local state during an active session. The server acts only as a bridge (relay) and never saves chat history to a database."
    },
    {
        question: "What is a 'Vibe Match' exactly?",
        answer: "Vibe Match is our way of connecting people based on their current energy. Instead of long bios, you pick a vibe (Chill, Deep, Chaotic, etc.), and we find others who are looking for that same wavelength in real-time."
    },
    {
        question: "How do Snapshots work?",
        answer: "Snapshots are one-time viewable images. Once the recipient opens it, a 10-second timer begins. After that, the image is permanently deleted from the chat state. No traces left."
    },
    {
        question: "Is the platform really free?",
        answer: "Yes, FreeNow is built for the community. There are no subscriptions or paywalls. It's just a space to connect, sync, and vibe without the baggage of traditional social media."
    },
    {
        question: "What should I do if my account is suspended?",
        answer: "If your account is suspended, it means our governance system (ICE Protocol) detected a violation of the community vibe. You can reach out to us via the 'Drop a Vibe' form on this page. Provide your registered name and email, and our administrators will review your case for possible reinstatement."
    }
];

function FAQItem({ faq, index }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isDarkMode } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`mb-4 rounded-3xl border transition-all duration-300 ${isOpen
                ? (isDarkMode ? 'bg-white/5 border-indigo-500/30' : 'bg-white border-indigo-200 shadow-xl shadow-indigo-500/5')
                : (isDarkMode ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-white/50 border-slate-100 hover:border-indigo-100')
                }`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
            >
                <span className="font-black text-lg tracking-tight">{faq.question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className={isDarkMode ? 'text-white/20' : 'text-slate-400'}
                >
                    <ChevronDown size={20} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`px-8 pb-8 text-sm leading-relaxed font-medium ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function SupportPage() {
    const { isDarkMode } = useTheme();
    const [formState, setFormState] = useState('idle'); // idle, sending, success
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

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
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => setFormState('idle'), 3000);
            }
        } catch (err) {
            console.error("Failed to send feedback:", err);
            setFormState('idle');
        }
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-indigo-500/30 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-rose-50/30 text-slate-800'}`}>
            <Navbar />

            {/* Background Accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] blur-[140px] rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] blur-[140px] rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-rose-500/10' : 'bg-rose-500/5'}`} />
            </div>

            <main className="max-w-6xl mx-auto px-6 py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <Link href="/" className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                        <ArrowLeft size={16} /> Close Help
                    </Link>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-700 bg-clip-text text-transparent">
                        Support Hub
                    </h1>
                    <p className={`text-xl font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        Answers for the curious, support for the seekers. How can we help you sync?
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* FAQ Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <HelpCircle size={24} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">Q&A Pulse</h2>
                        </div>

                        <div>
                            {FAQS.map((faq, idx) => (
                                <FAQItem key={idx} faq={faq} index={idx} />
                            ))}
                        </div>
                    </section>

                    {/* Feedback Form Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <MessageSquare size={24} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">Drop a Message</h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-10 rounded-[3rem] border backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-rose-100 shadow-2xl shadow-rose-500/5'
                                }`}
                        >
                            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ml-2 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Your Name</label>
                                    <div className="relative group">
                                        <User className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-white/20 group-focus-within:text-indigo-500' : 'text-slate-300 group-focus-within:text-indigo-600'}`} size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Prince..."
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full pl-14 pr-6 py-5 rounded-2xl outline-none font-bold transition-all border ${isDarkMode
                                                ? 'bg-white/5 border-white/5 focus:border-indigo-500/50 text-white'
                                                : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-200 text-slate-800'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ml-2 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Your Email</label>
                                    <div className="relative group">
                                        <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-white/20 group-focus-within:text-indigo-500' : 'text-slate-300 group-focus-within:text-indigo-600'}`} size={18} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="vibe@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full pl-14 pr-6 py-5 rounded-2xl outline-none font-bold transition-all border ${isDarkMode
                                                ? 'bg-white/5 border-white/5 focus:border-indigo-500/50 text-white'
                                                : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-200 text-slate-800'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ml-2 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Message / Feedback</label>
                                    <textarea
                                        required
                                        placeholder="Tell us what's on your mind..."
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className={`w-full px-6 py-5 rounded-3xl outline-none font-bold transition-all border resize-none ${isDarkMode
                                            ? 'bg-white/5 border-white/5 focus:border-indigo-500/50 text-white'
                                            : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-200 text-slate-800'
                                            }`}
                                    />
                                </div>

                                <button
                                    disabled={formState !== 'idle'}
                                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${formState === 'success'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-500/20'
                                        }`}
                                >
                                    {formState === 'idle' && (
                                        <>
                                            Send Message <Send size={18} />
                                        </>
                                    )}
                                    {formState === 'sending' && (
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Zap size={20} />
                                        </motion.div>
                                    )}
                                    {formState === 'success' && (
                                        <>
                                            Sent Successfully <CheckCircle2 size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                        </motion.div>

                        <div className="mt-12 p-8 rounded-[2rem] border bg-gradient-to-tr from-indigo-500/5 to-indigo-600/5 border-indigo-500/10 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <MessageSquare className="text-indigo-500" size={20} />
                            </div>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                                Your feedback helps us keep the network alive. We read every single message.
                            </p>
                        </div>
                    </section>
                </div>

                <footer className="mt-32 text-center border-t border-white/[0.05] pt-12">
                    <div className="flex flex-wrap justify-center gap-6 mb-8">
                        <Link href="/terms" className={`text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-colors ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Terms</Link>
                        <Link href="/privacy-policy" className={`text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-colors ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Privacy</Link>
                        <Link href="/refund-policy" className={`text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-colors ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Refunds</Link>
                        <Link href="/contact" className={`text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-colors ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Contact</Link>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`}>
                        &copy; {new Date().getFullYear()} FreeNow Support Hub. Always Listening.
                    </p>
                </footer>
            </main>
        </div>
    );
}
