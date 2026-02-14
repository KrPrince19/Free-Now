"use client";
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, ExternalLink, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function PostChatAd({ isOpen, onClose }) {
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            // 💰 ADSTERRA INTEGRATION POINT:
            // This is where you would normally load an external script.
            // For Social Bar or Native Banners, Adsterra usually provides a script tag.
            // Example:
            /*
            const script = document.createElement('script');
            script.src = "//your-adsterra-script-url.js";
            script.async = true;
            document.body.appendChild(script);
            */
            console.log("📢 Adsterra Slot Ready - Session Finished");
        }
    }, [isOpen]);

    const handleFinalExit = () => {
        onClose();
        router.push('/');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="max-w-xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl relative"
                    >
                        {/* Summary Header */}
                        <div className="p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                <Zap className="absolute top-4 left-4" size={100} />
                                <ShieldCheck className="absolute bottom-4 right-4" size={80} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter mb-2">Sync Complete!</h2>
                                <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Your session has been securely erased.</p>
                            </div>
                        </div>

                        {/* 💰 ADSTERRA PLACEHOLDER SLOT */}
                        <div className="p-10 text-center">
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 mb-8 flex flex-col items-center justify-center min-h-[250px] group transition-all hover:bg-slate-100/50">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-slate-300 group-hover:text-indigo-500 transition-colors">
                                    <ExternalLink size={24} />
                                </div>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-2">Sponsored Vibe</p>
                                <p className="text-slate-300 text-xs italic max-w-[200px]">
                                    (Paste your Adsterra script here in components/PostChatAd.jsx)
                                </p>

                                {/* 
                                   TIP FOR USER: 
                                   You can use Adsterra's 'Native Banner' code here. 
                                   It will look perfectly natural inside this box.
                                */}
                            </div>

                            <button
                                onClick={handleFinalExit}
                                className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                Return to Global Sync
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <X size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            </button>

                            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                                Stealth Engine v6.1 • Zero Retention
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
