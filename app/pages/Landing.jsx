"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  Heart,
  Stars,
  Zap,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  Activity,
  Sun,
  Moon,
  Trophy
} from "lucide-react";
import { socket } from "../lib/socket";
import { useTheme } from "../context/ThemeContext";


/* ================= COUNTER (ROLL-UP ANIMATION) ================= */
function Counter({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    Math.round(v).toLocaleString()
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

/* ================= TYPEWRITER COMPONENT ================= */
function Typewriter({ sentences }) {
  const [displayText, setDisplayText] = useState("");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSentence = sentences[sentenceIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentSentence.length) {
        setDisplayText(currentSentence.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(currentSentence.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentSentence.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setSentenceIndex((sentenceIndex + 1) % sentences.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, sentenceIndex, sentences]);

  return (
    <div className="h-8 flex items-center justify-center">
      <span className="text-rose-500 font-bold italic tracking-wide">{displayText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="w-[3px] h-6 bg-rose-500 ml-1 rounded-full"
      />
    </div>
  );
}

/* ================= FOOTER COMPONENT ================= */
function Footer({ isDark }) {
  return (
    <footer className={`relative z-10 py-12 border-t backdrop-blur-xl transition-colors duration-500 ${isDark ? 'bg-[#0a0a0c]/80 border-white/[0.03]' : 'bg-white/80 border-slate-100'}`}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-black italic text-sm">F</span>
          </div>
          <span className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>FreeNow</span>
        </div>

        <div className="text-center md:text-left">
          <p className={`text-sm font-medium transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            &copy; {new Date().getFullYear()} FreeNow. Reflecting the art of temporary syncs.
          </p>
          <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Developed by
            </span>
            <span className={`text-sm font-black bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent`}>
              Prince Kumar Yadav ❤️
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a href="#" className={`text-xs font-black uppercase tracking-widest hover:text-indigo-500 transition-colors ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Privacy</a>
          <a href="#" className={`text-xs font-black uppercase tracking-widest hover:text-indigo-500 transition-colors ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Terms</a>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isDark ? 'bg-white/5 border-white/5 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
            <Heart size={18} fill="currentColor" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ================= LANDING PAGE ================= */
export default function LandingPage() {
  const [monthlyStats, setMonthlyStats] = useState(0);
  const [yesterdayRecord, setYesterdayRecord] = useState({
    names: "Calculating...",
    duration: "0m",
  });
  const [liveChats, setLiveChats] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [pulses, setPulses] = useState([]); // { id, x, y }
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isDarkMode, updateVibeHue } = useTheme();

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/global-stats/monthly`
        );
        const statsData = await statsRes.json();
        const countValue = Number(statsData.count);
        setMonthlyStats(isNaN(countValue) ? 0 : countValue);

        const recordRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stats/longest-yesterday`
        );
        const recordData = await recordRes.json();

        if (recordData?.names) {
          setYesterdayRecord(recordData);
        } else {
          setYesterdayRecord({
            names: "Sarah & Marcus",
            duration: "2h 45m",
          });
        }

        const activeRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/active-conversations`
        );
        const activeData = await activeRes.json();
        setLiveChats(activeData || []);

        const usersRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activeusers`
        );
        const usersData = await usersRes.json();
        setActiveUsers(usersData || []);

        updateVibeHue(((activeData || []).length * 2) + (usersData || []).length);
      } catch (err) {
        console.error("Landing fetch error:", err);
      }
    };

    fetchData();
  }, []);

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
    socket.connect();

    socket.on('midnight-update', (data) => {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/global-stats/monthly`)
        .then(res => res.json())
        .then(statsData => setMonthlyStats(Number(statsData.count) || 0));

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stats/longest-yesterday`)
        .then(res => res.json())
        .then(recordData => { if (recordData?.names) setYesterdayRecord(recordData); });

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/active-conversations`)
        .then(res => res.json())
        .then(activeData => setLiveChats(activeData || []));
    });

    socket.on('month-reset', (data) => {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/global-stats/monthly`)
        .then(res => res.json())
        .then(statsData => setMonthlyStats(Number(statsData.count) || 0));
    });

    socket.on('conversation-started', (data) => {
      // Add a visual pulse
      const newPulse = { id: Date.now(), x: 20 + Math.random() * 60, y: 30 + Math.random() * 40 };
      setPulses(prev => [...prev.slice(-15), newPulse]);

      setTimeout(() => {
        setPulses(prev => prev.filter(p => p.id !== newPulse.id));
      }, 5000);

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/active-conversations`)
        .then(res => res.json())
        .then(activeData => {
          setLiveChats(activeData || []);
          updateVibeHue((activeData || []).length * 2);
        });
    });

    socket.on('conversation-ended', (data) => {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/active-conversations`)
        .then(res => res.json())
        .then(activeData => {
          setLiveChats(activeData || []);
        });
    });

    socket.on('users-update', (users) => {
      setActiveUsers(users || []);
    });

    return () => { socket.off(); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-rose-50/10 text-slate-900'}`}>
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          style={{ backgroundColor: `hsla(var(--vibe-hue), 60%, 50%, ${isDarkMode ? '0.1' : '0.05'})` }}
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000"
        />
        <div
          style={{ backgroundColor: `hsla(var(--vibe-hue), 60%, 50%, ${isDarkMode ? '0.1' : '0.05'})` }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000"
        />
      </div>


      {/* ================= HERO ================= */}
      <motion.section
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center"
      >
        <motion.h1
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-6xl md:text-7xl font-black mb-6 tracking-tight leading-tight"
        >
          Global. Instant. <br />
          <span className="text-indigo-600 drop-shadow-sm">Temporary.</span>
        </motion.h1>

        <div className="mb-12">
          <Typewriter
            sentences={[
              "Where hearts find their sync... ❤️",
              "Love in the moment, gone with the vibe... ✨😎",
              "A pulse shared across the world... 🌎💖",
              "Ephemeral chats, lasting memories... 🌹",
              "Vibe with someone special right now... 💑",
              "You are free to love, don't worry, just vibe... 🕊️❤️",
              "Let your heart wander, then find its home... 🏠💕",
              "No boundaries, just beautiful vibes... 🌊💖"
            ]}
          />
        </div>

        <div className="flex flex-col items-center gap-8 mb-16">
          <Link href="/dashboard">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-black py-5 px-14 rounded-3xl shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all">
              Find Someone Now
            </button>
          </Link>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group">
            <div className={`absolute -inset-1 blur-xl opacity-20 rounded-2xl animate-pulse ${isDarkMode ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
            <div className={`relative flex items-center gap-4 border px-8 py-4 rounded-[2rem] shadow-sm transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-indigo-50'}`}>
              <div className="relative">
                <div className="absolute -inset-1 bg-indigo-400 rounded-full animate-ping opacity-20" />
                <div className="relative w-7 h-7 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe size={14} className="text-white" />
                </div>
              </div>
              <p className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}>
                Over <span className="text-indigo-600 font-black text-lg mx-1"><Counter value={monthlyStats} /></span> connections this month
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================= YESTERDAY RECORD ================= */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-5xl mx-auto px-6 mb-32"
      >
        <div className={`bg-gradient-to-r from-indigo-500 via-purple-600 to-rose-500 p-1 rounded-[3.5rem] shadow-2xl overflow-hidden group relative`}>

          <div className={`rounded-[3.3rem] py-16 px-10 text-center relative overflow-hidden transition-colors duration-500 z-10 ${isDarkMode ? 'bg-[#111116]' : 'bg-white'}`}>

            {/* Box-specific floating hearts - Fixed Full Coverage */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{ left: `${12 + (i * 11)}%` }} // Fixed horizontal spread
                  initial={{ opacity: 0, top: "100%", scale: 0.4 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    top: "-15%",
                    scale: [0.4, 1.1, 0.6],
                    rotate: [0, 25, -25, 0]
                  }}
                  transition={{
                    duration: 7 + Math.random() * 5,
                    repeat: Infinity,
                    delay: i * 1.5,
                    ease: "linear"
                  }}
                  className="absolute"
                >
                  <Heart size={36} fill="currentColor" className={isDarkMode ? "text-rose-400/40" : "text-rose-500/30"} />
                </motion.div>
              ))}
            </div>

            <span className="flex justify-center gap-3 text-indigo-500 font-black uppercase tracking-[0.3em] text-[10px] mb-6 relative z-10">
              <Stars size={16} /> Yesterday's Longest Connection <Stars size={16} />
            </span>

            <h2 className={`text-5xl md:text-6xl font-serif italic mb-8 group-hover:scale-105 transition-transform duration-700 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {yesterdayRecord.names}
            </h2>

            <div className={`inline-flex items-center gap-3 border px-10 py-4 rounded-full transition-all relative z-10 ${isDarkMode ? 'bg-white/5 border-white/5 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
              <Trophy size={18} className="text-amber-400" />
              <p className="font-black italic text-sm">Legendary connection for {yesterdayRecord.duration}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================= TALKING NOW + GLOBAL PULSE ================= */}
      <motion.section
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 pb-32"
      >
        {/* Talking Now */}
        <div className={`rounded-[3rem] p-10 shadow-2xl relative overflow-hidden transition-all duration-500 border ${isDarkMode ? 'bg-[#111116] border-white/[0.03] text-white' : 'bg-slate-900 border-slate-800 text-white'}`}>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 flex items-center gap-2">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              Talking Now
            </h3>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{liveChats.length} Active Rooms</span>
          </div>

          <div className="space-y-5">
            {liveChats.length > 0 ? (
              liveChats.slice(0, 3).map((c, i) => (
                <TalkingRoom key={c.roomId || i} chat={c} currentTime={currentTime} />
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p className="italic text-slate-500 text-sm font-medium">Quiet globally... Be the first to start a vibe.</p>
              </div>
            )}
          </div>

          {liveChats.length > 3 && (
            <Link href="/dashboard" className="flex justify-between items-center mt-8 bg-white/5 hover:bg-white/10 transition-all p-5 rounded-3xl group border border-white/5">
              <span className="text-xs text-white/40 font-black uppercase tracking-widest group-hover:text-white transition-colors">
                Explore {liveChats.length - 3} other vibing rooms
              </span>
              <ArrowUpRight size={18} className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Global Pulse */}
        <div className={`rounded-[3rem] p-1 shadow-2xl transition-all duration-500 border ${isDarkMode ? 'bg-[#111116] border-white/[0.03]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="p-10">
            <h3 className={`flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] mb-10 ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>
              <Activity size={16} /> Global Pulse
            </h3>

            <div className="space-y-8">
              <PulseItem icon={<Zap />} title="Rapid Syncing" desc="Matches occurring globally in real-time across the network." isDark={isDarkMode} />
              <PulseItem icon={<ShieldCheck />} title="Stealth Mode" desc="No logs. No breadcrumbs. Everything vanishes instantly on exit." isDark={isDarkMode} />

              <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
                <Globe size={100} className="absolute -right-6 -bottom-6 opacity-10 group-hover:rotate-180 transition-transform duration-[3s]" />
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/50 mb-2">Core Philosophy</p>
                <p className="font-bold text-lg leading-snug tracking-tight">
                  “Restoring the art of spontaneous, human conversation—one ephemeral chat at a time.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Footer */}
      <motion.section
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`py-32 relative z-10 transition-colors duration-500 border-t ${isDarkMode ? 'bg-[#0a0a0c] border-white/[0.03]' : 'bg-slate-50 border-slate-100'}`}
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-16 text-center">
          <Feature icon={<Globe />} title="Infinite Reach" desc="Sync with anyone on the planet in a single pulse." isDark={isDarkMode} />
          <Feature icon={<ShieldCheck />} title="Pure Identity" desc="No profiles to stalk. No history to regret. Just you." isDark={isDarkMode} />
          <Feature icon={<Zap />} title="Real Pulse" desc="Instant visibility when you're ready to connect." isDark={isDarkMode} />
        </div>
      </motion.section>

      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
            <div className="max-w-2xl">
              <div className={`p-1 w-fit rounded-full mb-6 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-rose-50 border-rose-100'}`}>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>Live Pulse Map</div>
              </div>
              <h2 className={`text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Syncs across the <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500">Universe</span></h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-xs ${isDarkMode ? 'bg-slate-900 border-indigo-500/30 text-white' : 'bg-white border-indigo-500/20 text-slate-800'}`}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className={`text-[11px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{liveChats.length * 2}+ People <br />connected now</p>
            </div>
          </div>

          <div className={`relative aspect-video md:aspect-[21/9] rounded-[3.5rem] border overflow-hidden group/map ${isDarkMode ? 'bg-[#0c0c0e] border-white/[0.03]' : 'bg-white border-slate-100 shadow-2xl shadow-indigo-500/5'}`}>

            {/* --- SONAR RADAR BACKGROUND --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: [1, 4], opacity: [0.5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-64 h-64 border border-rose-500/20 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 4], opacity: [0.5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                className="absolute w-64 h-64 border border-rose-500/20 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 4], opacity: [0.5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
                className="absolute w-64 h-64 border border-rose-500/20 rounded-full"
              />
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 49.5%, rgba(244,63,94,0.3) 50%, transparent 50.5%)', backgroundSize: '100% 100%', transformOrigin: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-full h-full bg-gradient-to-r from-rose-500/10 to-transparent" />
              </div>
            </div>

            {/* PERSISTENT SYNC DOTS (Blinking Pink) */}
            <AnimatePresence>
              {[...liveChats, ...activeUsers].map((item, idx) => {
                const id = item.roomId || item.id || idx;
                const seed = id.toString();
                let hash = 0;
                for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
                const x = 15 + (Math.abs(hash % 700) / 10);
                const y = 25 + (Math.abs((hash >> 4) % 500) / 10);

                const isChat = !!item.roomId;

                return (
                  <motion.div
                    key={`dot-${seed}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute z-20"
                  >
                    <div className="relative group/dot">
                      {/* Label on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-[8px] text-white rounded opacity-0 group-hover/dot:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                        {isChat ? "Chatting..." : (item.name || "Offline")}
                      </div>

                      <motion.div
                        animate={isChat ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-3 h-3 -ml-1.5 -mt-1.5 rounded-full ${isChat ? 'bg-pink-500' : 'bg-pink-400/60'} shadow-[0_0_15px_rgba(236,72,153,0.6)] border border-white/20`}
                      >
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-full h-full rounded-full bg-inherit"
                        />
                      </motion.div>

                      {isChat && (
                        <motion.div
                          animate={{ scale: [1, 3], opacity: [0.4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-[-4px] rounded-full bg-pink-500/30"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* LIVE PULSES (Blinking Pink - New Connections) */}
            <AnimatePresence>
              {pulses.map(pulse => (
                <motion.div
                  key={pulse.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0.5, 2.5, 3.5], opacity: [0, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 4, ease: "easeOut" }}
                  style={{ left: `${pulse.x}%`, top: `${pulse.y}%` }}
                  className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full z-20 bg-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.7)]"
                />
              ))}
            </AnimatePresence>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-[-40px] border border-pink-500/20 rounded-full" />
                <div className={`relative px-12 py-6 rounded-[3rem] border backdrop-blur-3xl flex flex-col items-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-rose-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Sonar Active</span>
                  </div>
                  <h2 className={`text-xl font-thin tracking-[0.3em] uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    Global <span className="font-black text-pink-500">Sync</span> Tracking
                  </h2>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 z-30">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform flex items-center gap-3">
                <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Start Vibe Sync
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer isDark={isDarkMode} />
    </div>
  );
}

/* ================= HELPERS ================= */
function TalkingRoom({ chat, currentTime }) {
  const [name1, name2] = chat.names.split(' & ');
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white font-black shadow-lg">
          {name1?.[0] || 'A'}
        </div>
        <div className="flex-1 flex items-center justify-center relative px-2">
          <div className="h-[2px] w-full bg-white/10 relative">
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
          </div>
          <div className="absolute w-2 h-2 rounded-full bg-white/20 animate-pulse" />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
          {name2?.[0] || 'B'}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-black text-sm tracking-tight text-white/90">{chat.names}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Active Sync</span>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase bg-indigo-500/20 px-4 py-2 rounded-xl text-indigo-300 border border-indigo-500/10">
          {(() => {
            if (!chat.startTime) return chat.time;
            const diff = Math.max(0, Math.floor((currentTime - new Date(chat.startTime)) / 60000));
            return diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h`;
          })()} Active
        </span>
      </div>
    </motion.div>
  );
}

function PulseItem({ icon, title, desc, isDark }) {
  return (
    <div className="flex gap-5 group/item">
      <div className={`w-14 h-14 rounded-[1.2rem] shadow-sm border flex items-center justify-center transition-all group-hover/item:scale-110 ${isDark ? 'bg-white/5 border-white/5 text-indigo-400' : 'bg-white border-slate-100 text-indigo-600 shadow-xl'}`}>
        {icon}
      </div>
      <div>
        <p className={`font-black text-lg tracking-tight mb-1 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</p>
        <p className={`text-xs leading-relaxed transition-colors ${isDark ? 'text-white/30' : 'text-slate-500'}`}>{desc}</p>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc, isDark }) {
  return (
    <div className="group/feature">
      <div className={`w-20 h-20 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-8 transition-all group-hover/feature:scale-110 group-hover/feature:rotate-6 ${isDark ? 'bg-white/5 border border-white/5 text-indigo-400' : 'bg-white text-indigo-600 border border-slate-100'}`}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <h4 className={`font-black text-2xl mb-3 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
      <p className={`text-sm leading-relaxed transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{desc}</p>
    </div>
  );
}
