"use client";
import React, { useEffect, useState } from 'react';
import { useAuth, useUser, useClerk, UserButton } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { socket } from '../lib/socket';
import { useStatus } from '../context/StatusContext';
import ChatBox from '../components/ChatBox';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, CheckCircle2,
  Sparkles, Coffee, BellRing, Clock, Zap, MessageSquare, ShieldCheck, XCircle,
  Moon, Sun, Heart
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LoadingScreen from '../components/LoadingScreen';


export default function ProfilePage() {
  // --- 1. AUTH & ROUTING ---
  const { isLoaded, sessionId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // --- 2. GLOBAL STATUS CONTEXT ---
  const { isFree, statusText, setStatusText, toggleStatus } = useStatus();

  // --- 3. LOCAL STATE ---
  const [stats, setStats] = useState({ totalRequests: 0, matchesMade: 0 });
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeChat, setActiveChat] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeChat');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [history, setHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const { isDarkMode } = useTheme();

  // --- NEW STATES FOR TIMER, TOASTS & ANIMATION ---
  const [timeLeft, setTimeLeft] = useState(15);
  const [statusToast, setStatusToast] = useState(null);
  const [showConnectionAnimation, setShowConnectionAnimation] = useState(false);

  const showToast = (msg, type = "info") => {
    setStatusToast({ msg, type });
    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => setStatusToast(null), 6000);
  };

  // --- 4. SYNC USER TO MONGODB ---
  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user && sessionId) {
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
  }, [isLoaded, user, sessionId]);

  // --- 5. SOCKET LISTENERS & DATA FETCHING ---
  useEffect(() => {
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (isLoaded && sessionId && userEmail) {
      socket.connect();

      const handleRegister = () => {
        if (sessionId) {
          socket.emit('register-user', sessionId);
          console.log("Registered user on profile:", sessionId);
        }
      };

      if (socket.connected) handleRegister();
      socket.on('connect', handleRegister);

      const fetchData = async () => {
        setIsRefreshing(true);
        try {
          const [statsRes, historyRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-stats/${userEmail}`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/history/${userEmail}`)
          ]);
          setStats(await statsRes.json());
          setHistory(await historyRes.json());
          setInitialDataLoaded(true);
        } catch (err) { console.error("Fetch Error:", err); } finally { setIsRefreshing(false); }
      };
      fetchData();

      socket.on('receive-chat-request', (data) => {
        setIncomingRequest(data);
        setTimeLeft(15);
      });

      socket.on('request-expired', () => setIncomingRequest(null));
      socket.on('request-ignored', (data) => showToast(data.message, "info"));
      socket.on('request-rejected', (data) => showToast(data.message, "error"));
      socket.on('chat-started', (data) => {
        setShowConnectionAnimation(true);
        setActiveChat(data);
        localStorage.setItem('activeChat', JSON.stringify(data));
        toggleStatus(false); // Set status to busy locally when chat starts
        setTimeout(() => setShowConnectionAnimation(false), 2500);
      });
      socket.on('chat-init-receiver', (data) => {
        setShowConnectionAnimation(true);
        setActiveChat(data);
        localStorage.setItem('activeChat', JSON.stringify(data));
        toggleStatus(false); // Set status to busy locally when chat starts
        setTimeout(() => setShowConnectionAnimation(false), 2500);
      });

      return () => {
        socket.off('connect', handleRegister);
        socket.off();
      };
    }
  }, [isLoaded, sessionId, activeChat, user]);

  useEffect(() => {
    if (incomingRequest && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIncomingRequest(null);
    }
  }, [incomingRequest, timeLeft]);

  const handleAcceptRequest = () => {
    if (incomingRequest) {
      const tempRequestId = incomingRequest.senderId;
      const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;

      socket.emit('accept-chat', {
        senderId: tempRequestId,
        senderName: incomingRequest.senderName,
        receiverId: sessionId,
        receiverName: user.username || user.firstName,
        receiverVibe: statusText
      });

      toggleStatus(false, statusText);
      setIncomingRequest(null);
    }
  };

  const handleIgnoreRequest = () => {
    socket.emit('reject-chat', { senderId: incomingRequest.senderId, receiverId: sessionId });
    setIncomingRequest(null);
  };



  if (!isLoaded || !initialDataLoaded) return <LoadingScreen message="Syncing your Profile..." />;

  const visibleHistory = (Array.isArray(history) && showAllHistory) ? history : (Array.isArray(history) ? history.slice(0, 3) : []);

  return (
    <div className={`min-h-screen font-sans pb-20 overflow-x-hidden transition-colors duration-500 selection:bg-indigo-500/30 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-rose-50/30 text-slate-800'}`}>
      <Navbar />

      {/* --- BACKGROUND HEART ANIMATION --- */}

      {/* --- BACKGROUND ACCENTS --- */}
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

      <AnimatePresence>
        {statusToast && (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
            className={`fixed top-24 right-6 z-[110] p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 min-w-[300px] ${statusToast.type === "error" ? "bg-red-500/10 border-red-500/20" :
              isDarkMode ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-200" : "bg-white border-slate-100 text-slate-800"
              }`}
          >
            <div className={`p-2 rounded-lg ${statusToast.type === "error" ? "bg-red-500/20" : "bg-indigo-500/20"}`}>
              {statusToast.type === "error" ? <XCircle size={18} /> : <Zap size={18} />}
            </div>
            <p className="text-sm font-semibold">{statusToast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {incomingRequest && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className={`fixed bottom-10 left-6 right-6 z-[100] border p-6 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-2xl ${isDarkMode ? 'bg-[#1a1a1f]/90 border-white/10 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/20">
                <BellRing size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Incoming Invite</p>
                <p className="font-bold text-xl">{incomingRequest.senderName} wants to chat!</p>
              </div>
            </div>
            <div className="flex gap-3 items-center w-full sm:w-auto">
              <div className="flex flex-col items-center mr-4">
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Expires</span>
                <span className="text-sm font-mono text-rose-400">{timeLeft}s</span>
              </div>
              <button onClick={handleIgnoreRequest} className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl border transition-all font-bold text-sm ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>Ignore</button>
              <button onClick={handleAcceptRequest} className={`flex-1 sm:flex-none px-10 py-3 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-sm ${isDarkMode ? 'bg-white text-black font-black' : 'bg-rose-500 text-white font-black'}`}>Accept</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {activeChat && <ChatBox chatData={activeChat} currentUser={user.username || user.firstName} sessionId={sessionId} onClose={() => {
        setActiveChat(null);
        localStorage.removeItem('activeChat');
      }} />}

      <main className="max-w-2xl mx-auto p-6 pt-12 relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border ${isDarkMode ? 'text-white/30 bg-white/5 border-white/5' : 'text-slate-400 bg-white border-slate-100'}`}>
            <ShieldCheck size={14} className="text-emerald-500" /> Identity Verified
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 rounded-xl" } }} />

          </div>
        </div>

        {/* --- IDENTITY HEADER --- */}
        <section className={`relative group mb-12 p-10 rounded-[3.5rem] border transition-all duration-500 overflow-hidden text-center ${isDarkMode ? 'bg-[#111116] border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-rose-100 shadow-xl shadow-rose-500/5'
          }`}>
          {/* Gradient Border Glow */}
          <div className={`absolute -inset-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10`} />

          {/* Floating Hearts Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                style={{ left: `${15 + (i * 15)}%` }}
                initial={{ opacity: 0, top: "100%", scale: 0.4 }}
                animate={{
                  opacity: [0, 0.5, 0],
                  top: "-15%",
                  scale: [0.4, 1.1, 0.6],
                  rotate: [0, 25, -25, 0]
                }}
                transition={{
                  duration: 6 + Math.random() * 4,
                  repeat: Infinity,
                  delay: i * 1.2,
                  ease: "linear"
                }}
                className="absolute"
              >
                <Heart size={28} fill="currentColor" className={isDarkMode ? "text-rose-400/30" : "text-rose-500/20"} />
              </motion.div>
            ))}
          </div>

          <div className="relative inline-block mb-6 pt-4">
            <div className={`absolute inset-0 blur-[40px] rounded-full scale-110 ${isDarkMode ? 'bg-indigo-500/20' : 'bg-rose-500/10'}`} />
            <motion.div whileHover={{ scale: 1.05, rotate: 2 }} className="relative w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 p-[3px] rounded-[2.5rem] shadow-2xl cursor-pointer">
              <div className={`w-full h-full rounded-[2.35rem] flex items-center justify-center text-4xl font-black group/avatar overflow-hidden ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-white text-slate-800'}`}>
                {user?.username?.[0] || user?.firstName?.[0] || "?"}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              </div>
            </motion.div>
            <div className={`absolute bottom-0 right-2 w-7 h-7 rounded-lg border-4 flex items-center justify-center shadow-lg transition-colors ${isDarkMode ? 'border-[#0a0a0c]' : 'border-white'} ${isFree ? 'bg-emerald-500' : isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isFree ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
            </div>
          </div>
          <h1 className={`text-4xl font-black tracking-tight mb-2 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{user?.username || user?.firstName}</h1>
          <p className={`font-medium text-sm tracking-wide mb-6 relative z-10 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>@{user?.username || user?.firstName}</p>

          <div className="flex justify-center gap-3">
            <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/5 border-white/10 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
              Tier 01 Explorer
            </div>
            <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${isFree ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : isDarkMode ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
              {isFree ? "Live Now" : "Invisible"}
            </div>
          </div>
        </section>

        {/* --- AVAILABILITY INTERFACE --- */}
        <section className={`rounded-[3rem] p-1 border shadow-2xl mb-10 overflow-hidden group transition-all duration-500 ${isDarkMode ? 'bg-[#111116] border-white/[0.03]' : 'bg-white border-rose-100'}`}>
          <div className={`p-8 rounded-[2.8rem] border transition-all duration-500 ${isDarkMode ? 'bg-[#1a1a21]/50 border-white/5' : 'bg-transparent border-transparent'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Vibe Presence <Sparkles size={18} className="text-indigo-400" /></h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/30' : 'text-slate-400 italic'}`}>{isFree ? "Broadcasting to the network" : "Your profile is currently hidden"}</p>
              </div>
              <button
                onClick={() => toggleStatus(!isFree, statusText)}
                className={`w-14 h-8 rounded-full transition-all duration-500 relative ${isFree ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : isDarkMode ? 'bg-white/5' : 'bg-slate-200 shadow-inner'}`}
              >
                <motion.div animate={{ x: isFree ? 24 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 bg-white w-6 h-6 rounded-full shadow-lg" />
              </button>
            </div>
            <div className="relative group/input">
              <input
                type="text"
                placeholder="Drop a vibe status..."
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                disabled={isFree}
                className={`w-full rounded-2xl px-6 py-5 text-lg outline-none transition-all placeholder:text-white/20 border ${isDarkMode ? 'bg-white/10 border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.15] text-white' :
                  'bg-rose-50/50 border-rose-100 focus:bg-white focus:ring-4 focus:ring-rose-100 text-slate-800'
                  } ${isFree ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
              <Coffee className={`absolute right-6 top-5 transition-colors ${isFree ? 'text-indigo-400' : 'text-slate-300'}`} size={24} />
            </div>
          </div>
        </section>

        {/* --- PERFORMANCE METRICS --- */}
        <div className="grid grid-cols-2 gap-5 mb-10">
          <div className={`p-[1px] rounded-[2.5rem] border group transition-all duration-500 ${isDarkMode ? 'bg-[#111116] border-white/[0.03]' : 'bg-white border-rose-100 shadow-sm'}`}>
            <div className={`p-8 rounded-[2.45rem] border text-center transition-all duration-500 ${isDarkMode ? 'bg-[#1a1a21]/50 border-white/5 group-hover:bg-[#1a1a21]' : 'bg-transparent border-transparent group-hover:bg-rose-50/30'}`}>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Send size={20} className="text-indigo-400" />
              </div>
              <p className={`text-4xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.totalRequests || 0}</p>
              <p className={`text-[10px] uppercase font-bold mt-3 tracking-[0.2em] ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Pings Sent</p>
            </div>
          </div>
          <div className={`p-[1px] rounded-[2.5rem] border group transition-all duration-500 ${isDarkMode ? 'bg-[#111116] border-white/[0.03]' : 'bg-white border-rose-100 shadow-sm'}`}>
            <div className={`p-8 rounded-[2.45rem] border text-center transition-all duration-500 ${isDarkMode ? 'bg-[#1a1a21]/50 border-white/5 group-hover:bg-[#1a1a21]' : 'bg-transparent border-transparent group-hover:bg-green-50/30'}`}>
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <CheckCircle2 size={20} className="text-rose-400" />
              </div>
              <p className={`text-4xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.matchesMade || 0}</p>
              <p className={`text-[10px] uppercase font-bold mt-3 tracking-[0.2em] ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Match Count</p>
            </div>
          </div>
        </div>

        {/* --- ACTIVITY TIMELINE --- */}
        <section className={`rounded-[3rem] p-1 border shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-[#111116] border-white/[0.03]' : 'bg-white border-rose-100'}`}>
          <div className={`p-8 rounded-[2.8rem] border transition-all duration-500 ${isDarkMode ? 'bg-[#1a1a21]/50 border-white/5' : 'bg-transparent border-transparent'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className={`flex items-center gap-3 font-black text-lg uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" /> Activity Log
              </h3>
              {isRefreshing && <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
            </div>

            <div className="space-y-6 relative">
              {(history.length > 0) && <div className={`absolute left-[23px] top-2 bottom-6 w-[1px] ${isDarkMode ? 'bg-white/[0.05]' : 'bg-slate-100'}`} />}

              {Array.isArray(history) && history.length > 0 ? (
                <>
                  {visibleHistory.map((log, i) => {
                    let partnerDisplayName = "Explorer";
                    if (log.type === 'CONVERSATION' && log.participants && log.participantNames) {
                      const partnerId = log.participants.find(id => id !== sessionId);
                      partnerDisplayName = log.participantNames[partnerId] || "Explorer";
                    }

                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i}
                        className="flex gap-6 items-start relative z-10"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${isDarkMode ? 'border-white/5 bg-indigo-500/20 text-indigo-400' : 'border-slate-50 bg-rose-50 text-rose-500'
                          }`}>
                          {log.type === 'CONVERSATION' ? <MessageSquare size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="flex-1 py-1">
                          <p className={`font-bold text-base tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {log.detail || (log.type === 'CONVERSATION' ? `Connection with ${partnerDisplayName}` : 'Activity logged')}
                          </p>
                          <p className={`text-[10px] font-black uppercase mt-1 tracking-widest ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>
                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {history.length > 3 && (
                    <button
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className={`w-full mt-4 py-4 rounded-2xl border text-xs font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] ${isDarkMode ? 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white' :
                        'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                    >
                      {showAllHistory ? "Show Less" : `View ${history.length - 3} More Activities`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-10">
                  <p className={`italic text-sm font-medium ${isDarkMode ? 'text-white/10' : 'text-slate-400'}`}>Your sync history is currently empty.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

