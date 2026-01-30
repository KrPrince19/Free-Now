"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { usePathname } from 'next/navigation';
import { socket } from '../lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Ban, ShieldAlert, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const ModerationContext = createContext();

export const ModerationProvider = ({ children }) => {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();
    const [isSuspended, setIsSuspended] = useState(false);
    const [needsAcknowledge, setNeedsAcknowledge] = useState(false);
    const [systemWarning, setSystemWarning] = useState(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        if (!isLoaded || !user) return;

        const email = user.primaryEmailAddress?.emailAddress;

        const fetchModerationStatus = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/user-stats/${email}`);
                const data = await res.json();
                setIsSuspended(data.isSuspended || false);
                setNeedsAcknowledge(data.needsUnsuspendAcknowledge || false);
                setSystemWarning(data.systemWarning || null);
            } catch (err) {
                console.error("Failed to fetch moderation status:", err);
            }
        };

        fetchModerationStatus();

        // Listen for real-time moderation events
        socket.on('admin-warning', (data) => {
            if (data.email === email) {
                setSystemWarning(data.message);
            }
        });

        socket.on('admin-suspension', async (data) => {
            if (data.email === email) {
                console.log("🛡️ Moderation Update Received:", data);
                setIsSuspended(data.isSuspended);
                if (data.needsUnsuspendAcknowledge) {
                    setNeedsAcknowledge(true);
                }
                // Resilience fetch to ensure state matches DB
                fetchModerationStatus();
            }
        });

        return () => {
            socket.off('admin-warning');
            socket.off('admin-suspension');
        };
    }, [user, isLoaded, backendUrl]);

    const clearWarning = async () => {
        if (!user) return;
        const email = user.primaryEmailAddress?.emailAddress;
        try {
            await fetch(`${backendUrl}/api/user-stats/${email}/clear-warning`, { method: 'POST' });
            setSystemWarning(null);
        } catch (err) {
            console.error("Failed to clear warning:", err);
        }
    };

    const handleAcknowledgeUnsuspend = async () => {
        if (!user) return;
        const email = user.primaryEmailAddress?.emailAddress;
        try {
            await fetch(`${backendUrl}/api/user-stats/${email}/acknowledge-unsuspend`, { method: 'POST' });
            setNeedsAcknowledge(false);
        } catch (err) {
            console.error("Failed to acknowledge unsuspend:", err);
        }
    };

    const isPublicPage = pathname === '/support' || pathname === '/terms';

    return (
        <ModerationContext.Provider value={{ isSuspended, systemWarning, clearWarning }}>
            {/* Global Suspension Lockdown Overlay */}
            <AnimatePresence>
                {isSuspended && !isPublicPage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center bg-[#0a0a0c]"
                    >
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="max-w-md">
                            <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                                <Ban size={48} className="text-rose-500" />
                            </div>
                            <h1 className="text-4xl text-white font-black tracking-tighter mb-4">Access Restricted</h1>
                            <p className="text-lg text-white/60 font-medium mb-10 leading-relaxed">
                                Your account has been temporarily suspended for community guideline violations.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 inline-block mb-4">
                                    ICE Protocol Active
                                </div>

                                <Link
                                    href="/support"
                                    className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors font-bold uppercase tracking-[0.2em] text-[10px]"
                                >
                                    <Mail size={14} /> Contact Organizers to Appeal
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Warning Alert */}
            <AnimatePresence>
                {systemWarning && !isSuspended && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-0 left-0 right-0 z-[900] p-4 lg:p-6">
                        <div className="max-w-2xl mx-auto bg-amber-500 text-black p-5 md:p-6 rounded-[2rem] shadow-2xl border-b-4 border-amber-600 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 overflow-hidden">
                            <div className="bg-black/10 p-4 rounded-2xl shrink-0 hidden md:flex">
                                <AlertTriangle size={32} />
                            </div>
                            <div className="bg-black/10 p-3 rounded-xl shrink-0 flex md:hidden">
                                <AlertTriangle size={20} />
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldAlert size={14} className="opacity-60 shrink-0" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 shrink-0">Admin Notification</p>
                                </div>
                                <p className="font-bold text-sm md:text-base leading-relaxed break-words">
                                    {systemWarning}
                                </p>
                            </div>

                            <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0 flex justify-end">
                                <button
                                    onClick={clearWarning}
                                    className="w-full md:w-auto px-6 py-3 bg-black/90 text-white md:bg-black/5 md:text-black hover:bg-black/10 rounded-xl md:rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl md:shadow-none shrink-0"
                                >
                                    Confirm & Dismiss
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unsuspend Acknowledgment Protocol */}
            <AnimatePresence>
                {needsAcknowledge && !isSuspended && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1100] flex items-center justify-center p-6 text-center bg-black/40 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-rose-100"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-inner">
                                <ShieldCheck size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Suspension Removed</h2>
                            <p className="text-base text-slate-500 font-medium mb-8 leading-relaxed">
                                Your suspension has been removed.
                                <br /><br />
                                Please be advised: In the future, if you make the same mistake, your account will be
                                <span className="text-rose-500 font-black px-1 underline decoration-2 decoration-rose-200">Permanently Deleted</span>
                                instead of suspended.
                            </p>

                            <button
                                onClick={handleAcknowledgeUnsuspend}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                            >
                                I Understand & Agree
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {children}
        </ModerationContext.Provider>
    );
};

export const useModeration = () => useContext(ModerationContext);
