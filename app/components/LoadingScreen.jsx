"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LoadingScreen({ message = "Syncing your vibe..." }) {
    const { isDarkMode } = useTheme();

    return (
        <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-rose-50/30'}`}>

            {/* Background Animated Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ backgroundColor: `hsla(var(--vibe-hue, 240), 70%, 50%, ${isDarkMode ? '0.15' : '0.08'})` }}
                    className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -60, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    style={{ backgroundColor: `hsla(var(--vibe-hue, 240), 70%, 50%, ${isDarkMode ? '0.12' : '0.06'})` }}
                    className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Central Animated Icon Container */}
                <div className="relative mb-12">
                    {/* Pulsing Rings */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [0.8, 2], opacity: [0.5, 0] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 1,
                                ease: "easeOut"
                            }}
                            className={`absolute inset-0 rounded-full border-2 ${isDarkMode ? 'border-indigo-500/30' : 'border-rose-400/30'}`}
                        />
                    ))}

                    {/* Main Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{
                            scale: { type: "spring", stiffness: 260, damping: 20 },
                            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className={`relative w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center shadow-2xl backdrop-blur-xl border-2 transition-all duration-500 ${isDarkMode
                                ? 'bg-white/5 border-white/10 shadow-black/50 text-indigo-400'
                                : 'bg-white border-rose-100 shadow-rose-500/10 text-rose-500'
                            }`}
                    >
                        <motion.div
                            animate={{
                                opacity: [1, 0.5, 1],
                                filter: ["drop-shadow(0 0 0px transparent)", "drop-shadow(0 0 15px currentColor)", "drop-shadow(0 0 0px transparent)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles size={48} className="md:w-16 md:h-16" strokeWidth={1.5} />
                        </motion.div>

                        <motion.div
                            animate={{
                                y: [0, -5, 0],
                                rotate: [0, 360],
                                opacity: [0.4, 0.8, 0.4]
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-2 -right-2"
                        >
                            <Zap size={24} className={isDarkMode ? 'text-indigo-300' : 'text-rose-300'} />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Shimmering Text */}
                <div className="text-center overflow-hidden">
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`text-2xl md:text-3xl font-black tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                        {message}
                    </motion.h2>

                    <div className="flex items-center justify-center gap-1.5 h-1">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scaleX: [1, 2, 1],
                                    opacity: [0.3, 1, 0.3],
                                    backgroundColor: ['#6366f1', '#f43f5e', '#6366f1']
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeInOut"
                                }}
                                className="w-4 h-full rounded-full"
                            />
                        ))}
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.5 }}
                        className={`mt-8 text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}
                    >
                        End-to-End Vibe Security Enabled
                    </motion.p>
                </div>
            </div>

            <style jsx>{`
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </div>
    );
}
