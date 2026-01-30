"use client";
import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import { useUser, useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Sparkles, MessageCircle, Coffee, Zap, BellRing,
  Trophy, Clock, Heart, Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useStatus } from '../context/StatusContext';

function Counter({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function Dashboard() {
  const { user } = useUser();
  const { sessionId } = useAuth();
  const { statusText, toggleStatus } = useStatus();
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [filterTag, setFilterTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeChat, setActiveChat] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeChat');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [monthlyMatches, setMonthlyMatches] = useState(0);

  const [timeLeft, setTimeLeft] = useState(15);
  const [statusToast, setStatusToast] = useState(null);
  const [showConnectionAnimation, setShowConnectionAnimation] = useState(false);
  const { isDarkMode, updateVibeHue } = useTheme();

  const showToast = (msg, type = "info", isHeartbreak = false) => {
    setStatusToast({ msg, type, isHeartbreak });
    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => setStatusToast(null), 7000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activeusers`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/global-stats/monthly`)
        ]);

        const usersData = await usersRes.json();
        setNearbyUsers(Array.isArray(usersData) ? usersData : []);

        const statsData = await statsRes.json();
        setMonthlyMatches(statsData.count || 0);

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const syncUser = async () => {
      if (sessionId && user) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sync-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.username || user.firstName
            })
          });
        } catch (err) { console.error("Sync Error:", err); }
      }
    };
    syncUser();
    fetchData();

    socket.connect();

    const handleRegister = () => {
      if (sessionId) {
        socket.emit('register-user', sessionId);
        console.log("Registered user on dashboard:", sessionId);
      }
    };

    if (socket.connected) handleRegister();
    socket.on('connect', handleRegister);

    socket.on("users-update", (users) => {
      setNearbyUsers(users);
      updateVibeHue(users.length);
    });
    socket.on('receive-chat-request', (data) => { setIncomingRequest(data); setTimeLeft(15); });
    socket.on('request-expired', () => setIncomingRequest(null));
    socket.on('request-ignored', (data) => showToast(data.message, "timeout", false));
    socket.on('request-failed', (data) => showToast(data.message, "reject", false));
    socket.on('request-rejected', (data) => showToast(data.message, "reject", true));
    socket.on('request-sent-success', () => showToast("Vibe check sent! ✨", "success", false));
    socket.on('chat-started', (data) => {
      setShowConnectionAnimation(true);
      setActiveChat(data);
      localStorage.setItem('activeChat', JSON.stringify(data));
      toggleStatus(false);
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/global-stats/monthly`).then(res => res.json()).then(d => setMonthlyMatches(d.count || 0));
      setTimeout(() => setShowConnectionAnimation(false), 2500);
    });
    socket.on('chat-init-receiver', (data) => {
      setShowConnectionAnimation(true);
      setActiveChat(data);
      localStorage.setItem('activeChat', JSON.stringify(data));
      toggleStatus(false);
      setTimeout(() => setShowConnectionAnimation(false), 2500);
    });

    return () => {
      socket.off('connect', handleRegister);
      socket.off('users-update');
      socket.off('receive-chat-request');
      socket.off('request-expired');
      socket.off('request-ignored');
      socket.off('request-failed');
      socket.off('request-rejected');
      socket.off('request-sent-success');
      socket.off('chat-started');
      socket.off('chat-init-receiver');
    };
  }, [sessionId, user]);

  useEffect(() => {
    if (incomingRequest && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIncomingRequest(null);
    }
  }, [incomingRequest, timeLeft]);

  const handleSayHi = (receiverId) => {
    if (!user) return showToast("Please sign in first!", "reject");
    if (!sessionId) return showToast("Authenticating session...", "info");

    const receiver = nearbyUsers.find(u => u.id === receiverId);
    const receiverName = receiver ? receiver.name : "Explorer";

    socket.emit('send-chat-request', {
      senderId: sessionId,
      senderName: user.username || user.firstName,
      receiverId,
      receiverName: receiverName,
      senderVibe: statusText || "free"
    });
  };

  const handleAcceptRequest = () => {
    setIncomingRequest(null);
    socket.emit('accept-chat', {
      senderId: incomingRequest.senderId,
      senderName: incomingRequest.senderName,
      receiverId: sessionId,
      receiverName: user.username || user.firstName
    });
  };

  const handleIgnoreRequest = () => {
    socket.emit('reject-chat', { senderId: incomingRequest.senderId, receiverId: sessionId });
    setIncomingRequest(null);
  };

  const VIBE_TAGS = ["All", "Chill", "Deep", "Music", "Gaming", "Tea", "Coffee"];

  const filteredUsers = nearbyUsers.filter((u) => {
    if (u.id === sessionId) return false;
    if (filterTag === "All") return true;
    return u.status?.toLowerCase().includes(filterTag.toLowerCase());
  });

  if (loading) return (
    <div className={`h-screen flex flex-col items-center justify-center transition-colors ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-rose-50/20'}`}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Sparkles className="text-rose-400 w-10 h-10" />
      </motion.div>
    </div>
  );

  return (
    <div className={`min-h-screen relative pb-20 font-sans overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-rose-50/20 text-slate-900'}`}>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div style={{ backgroundColor: `hsla(var(--vibe-hue), 60%, 50%, ${isDarkMode ? '0.1' : '0.05'})` }} className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000" />
        <div style={{ backgroundColor: `hsla(var(--vibe-hue), 60%, 50%, ${isDarkMode ? '0.1' : '0.05'})` }} className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-all duration-1000" />
      </div>

      <AnimatePresence>
        {showConnectionAnimation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-lg" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.6, type: "spring" }} className="text-9xl">🤝</motion.div>
              <div className="flex items-center gap-4">
                <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-6xl">❤️</motion.div>
                <div className="h-1 w-32 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 rounded-full relative overflow-hidden" />
                <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-6xl">❤️</motion.div>
              </div>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-white text-2xl font-black">Connection Made! ✨</motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statusToast && (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className={`fixed top-24 right-6 z-[100] p-5 rounded-3xl shadow-2xl border flex items-center gap-4 min-w-[320px] backdrop-blur-md ${statusToast.isHeartbreak ? "bg-slate-950/95 border-rose-500/50 text-white" : isDarkMode ? "bg-[#1a1a21]/95 border-white/10 text-white" : "bg-rose-500/95 border-rose-400 text-white"}`}>
            <div className={`p-2.5 rounded-2xl flex items-center justify-center min-w-[55px] min-h-[55px] ${isDarkMode ? 'bg-white/5' : 'bg-white/10'}`}>
              {statusToast.isHeartbreak ? <Heart fill="#f43f5e" size={24} className="text-rose-500" /> : <Clock size={24} className="text-white" />}
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${statusToast.isHeartbreak ? "text-rose-400" : "opacity-60"}`}>{statusToast.isHeartbreak ? "Heartbreak" : "Vibe Update"}</p>
              <p className="text-sm font-bold tracking-tight leading-snug">{statusToast.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {incomingRequest && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className={`fixed bottom-10 left-6 right-6 z-50 p-6 rounded-[2.5rem] shadow-2xl border-2 flex flex-col gap-4 overflow-hidden backdrop-blur-2xl ${isDarkMode ? 'bg-[#1a1a1f]/90 border-white/10' : 'bg-slate-900 border-transparent text-white'}`}>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-rose-500 p-3 rounded-2xl animate-pulse"><BellRing size={20} className="text-white" /></div>
                <div>
                  <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Incoming Vibe</p>
                  <p className="font-bold text-lg text-white">{incomingRequest.senderName} wants to chat!</p>
                </div>
              </div>
              <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-mono font-bold text-rose-400 border border-white/5">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
            </div>
            <div className="flex gap-2 relative z-10">
              <button onClick={handleIgnoreRequest} className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-white/5 text-slate-400'}`}>Pass</button>
              <button onClick={handleAcceptRequest} className="flex-[2] bg-rose-500 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg">Accept vibe</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeChat && (
        <ChatBox chatData={activeChat} currentUser={user?.username || user?.firstName} sessionId={sessionId} onClose={() => { setActiveChat(null); localStorage.removeItem('activeChat'); }} />
      )}

      <div className="relative z-10">
        <Navbar />
        <div className="max-w-md mx-auto p-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 text-white group-hover:scale-110 transition-transform duration-700"><Globe size={140} /></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Global Monthly Reach</p>
                <h2 className="text-white text-4xl font-black"><Counter value={monthlyMatches} /></h2>
              </div>
              <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl"><Trophy className="text-white" size={28} /></div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>People Active Now</h3>
            <span className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-full border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> {nearbyUsers.filter(u => u.id !== sessionId).length} Online Syncs
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
            {VIBE_TAGS.map(tag => (
              <button key={tag} onClick={() => setFilterTag(tag)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${filterTag === tag ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105' : isDarkMode ? 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>{tag}</button>
            ))}
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <motion.div key={u.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl transition-all border group hover:scale-[1.02] ${isDarkMode ? 'bg-[#111116] border-white/5 shadow-black/20' : 'bg-white border-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-500/20">{u.name ? u.name[0] : "?"}</div>
                      <div>
                        <h4 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{u.name}</h4>
                        <div className="flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent italic mt-1"><Coffee size={14} className="text-rose-400" /> "{u.status}"</div>
                      </div>
                    </div>
                    <button onClick={() => handleSayHi(u.id)} className={`px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2 ${isDarkMode ? 'bg-white text-black font-black' : 'bg-slate-900 text-white font-black hover:bg-rose-500'}`}><span className="text-[10px] uppercase tracking-wider">Connect</span><MessageCircle size={16} /></button>
                  </motion.div>
                ))
              ) : (
                <EmptyContent isSelfActive={nearbyUsers.length > 0} isDark={isDarkMode} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyContent({ isSelfActive, isDark }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[50vh] flex flex-col items-center justify-center text-center">
      <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 border transition-all ${isDark ? 'bg-white/5 border-white/5 text-indigo-400' : 'bg-white border-slate-100 text-rose-400'}`}><Sparkles size={40} /></div>
      <h2 className={`text-2xl font-black mb-3 tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>{isSelfActive ? "You're first on the scene!" : "Quiet at the moment..."}</h2>
      <p className={`text-sm max-w-[240px] italic font-medium ${isDark ? 'text-white/20' : 'text-slate-400'}`}>{isSelfActive ? "Stay active—the network is syncing. Someone will vibe with you soon! 🌟" : "No active syncs found. Start the vibe from your profile!"}</p>
    </motion.div>
  );
}
