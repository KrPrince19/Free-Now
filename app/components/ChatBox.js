"use client";
import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { Send, X, ShieldCheck, Clock, Smile, Sparkles, Heart, Zap, User, Edit2, Trash2, Copy, Check, Camera, Eye, AlertCircle, Activity, Pencil, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CURATED_EMOJIS = ["❤️", "✨", "😂", "😍", "🔥", "🙌", "🥂", "🌟", "🌸", "🦋", "🍭", "🧸", "🦄", "🌈"];
const ICEBREAKERS = [
  "If you could have dinner with anyone, dead or alive, who would it be? 🍽️",
  "What's the most spontaneous thing you've ever done? ⚡",
  "What's your current 'comfort' song? 🎧",
  "If you could teleport anywhere right now, where would you go? 🌎",
  "What's a hobby you've always wanted to try but never have? ✨",
  "Morning person or night owl? 🦉",
  "What's your go-to coffee or tea order? ☕",
  "What's the best piece of advice you've ever received? 💡",
  "If you were a superhero, what would your power be? 🦸",
  "What's something that always makes you smile? 😊",
  "Beach vacation or mountain hike? 🏔️",
  "What's your favorite way to spend a rainy day? ☔",
  "If you could master any skill instantly, what would it be? 🎓",
  "What's the last thing that made you laugh out loud? 😂",
  "If you had to describe your vibe today in three words, what would they be? ✨",
  "What's a movie or book you think everyone should see/read? 📚",
  "What's your hidden talent? 🎭",
  "If you were a traveler, would you go to the future or the past? 🕰️",
  "What's your favorite season and why? 🍂",
  "If you could only eat one meal for the rest of your life, what would it be? 🍕"
];

export default function ChatBox({ chatData, currentUser, sessionId, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`chat_messages_${chatData.roomId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState({ name: chatData.partnerName, left: false });
  const [editingMessage, setEditingMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isSparking, setIsSparking] = useState(false);
  const [viewingImageId, setViewingImageId] = useState(null);
  const [imageTimers, setImageTimers] = useState({}); // id -> secondsLeft
  const [stagedImage, setStagedImage] = useState(null);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [partnerSelected, setPartnerSelected] = useState(false);
  const [mySelection, setMySelection] = useState(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [showMissAnimation, setShowMissAnimation] = useState(false);
  const [activeReactions, setActiveReactions] = useState([]); // Array of { id, x, y, emoji }
  const [isDoodleOpen, setIsDoodleOpen] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingContextRef = useRef(null);
  const lastDrawingPos = useRef(null);
  const fileInputRef = useRef();
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  // --- SAVE MESSAGES TO LOCALSTORAGE ---
  useEffect(() => {
    if (chatData.roomId) {
      localStorage.setItem(`chat_messages_${chatData.roomId}`, JSON.stringify(messages));
    }
  }, [messages, chatData.roomId]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setIsPartnerTyping(false);
    });

    socket.on('partner-typing', () => {
      setIsPartnerTyping(true);
    });

    socket.on('partner-stop-typing', () => {
      setIsPartnerTyping(false);
    });

    socket.on('partner-left', (data) => {
      setPartnerDetails(prev => ({ ...prev, left: true }));
      setMessages(prev => [...prev, { system: true, text: `${data.senderName || "Your partner"} has left the vibe session.` }]);
    });

    socket.on('message-updated', ({ messageId, newText }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, text: newText, edited: true } : m));
    });

    socket.on('message-deleted', ({ messageId }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, text: "This message was deleted", deleted: true } : m));
    });

    socket.on('vibe-game-status', ({ isOpen }) => {
      setIsGameOpen(isOpen);
      if (!isOpen) {
        setGameState(null);
        setLastRoundResult(null);
        setMySelection(null);
        setPartnerSelected(false);
      }
    });

    socket.on('vibe-game-state', (state) => {
      setGameState(state);
      setLastRoundResult(null);
      setMySelection(null);
      setPartnerSelected(false);
    });

    socket.on('vibe-partner-selected', ({ sessionId: pSessionId }) => {
      if (pSessionId !== sessionId) {
        setPartnerSelected(true);
      }
    });

    socket.on('vibe-round-result', ({ selections, isMatch }) => {
      setLastRoundResult({ selections, isMatch });
      if (isMatch) {
        setShowMatchAnimation(true);
        setTimeout(() => setShowMatchAnimation(false), 3000);
      } else {
        setShowMissAnimation(true);
        setTimeout(() => setShowMissAnimation(false), 3000);
      }
    });

    socket.on('message-reaction-ribbon', ({ messageId, emoji }) => {
      const el = document.getElementById(`msg-bubble-${messageId}`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;

      const id = Date.now() + Math.random();
      setActiveReactions(prev => [...prev, { emoji, x, y, id }]);
      setTimeout(() => {
        setActiveReactions(prev => prev.filter(r => r.id !== id));
      }, 4000);
    });

    socket.on('draw-room-clear', () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    socket.on('draw-partner-start', ({ x, y, color }) => {
      if (!drawingContextRef.current) return;
      drawingContextRef.current.beginPath();
      drawingContextRef.current.strokeStyle = color;
      drawingContextRef.current.moveTo(x, y);
    });

    socket.on('draw-partner-move', ({ x, y }) => {
      if (!drawingContextRef.current) return;
      drawingContextRef.current.lineTo(x, y);
      drawingContextRef.current.stroke();
    });

    socket.on('draw-room-toggle', ({ isOpen }) => {
      setIsDoodleOpen(isOpen);
    });

    return () => {
      socket.off('new-message');
      socket.off('partner-typing');
      socket.off('partner-stop-typing');
      socket.off('partner-left');
      socket.off('message-updated');
      socket.off('message-deleted');
      socket.off('vibe-game-status');
      socket.off('vibe-game-state');
      socket.off('vibe-partner-selected');
      socket.off('vibe-round-result');
      socket.off('message-reaction-ribbon');
      socket.off('draw-partner-start');
      socket.off('draw-partner-move');
      socket.off('draw-room-clear');
      socket.off('draw-room-toggle');
    };
  }, []);

  // --- AUTO SCROLL ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  // --- HANDLING TYPING ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    // Emit typing event
    socket.emit('typing', { roomId: chatData.roomId, senderName: currentUser });

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set new timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { roomId: chatData.roomId });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if ((!message.trim() && !stagedImage) || partnerDetails.left) return;

    socket.emit('send-private-message', {
      roomId: chatData.roomId,
      message: stagedImage || message.trim(),
      senderName: currentUser,
      type: stagedImage ? 'image' : 'text'
    });

    // Stop typing immediately when message is sent
    socket.emit('stop-typing', { roomId: chatData.roomId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setMessage("");
    setStagedImage(null);
    setIsEmojiPickerOpen(false);
  };

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setMessage(msg.text);
    setIsEmojiPickerOpen(false);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setMessage("");
  };

  const handleDeleteMessage = (messageId) => {
    socket.emit('delete-message', { roomId: chatData.roomId, messageId });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Image too large! Max 2MB for vanishing snapshots.");

    const reader = new FileReader();
    reader.onloadend = () => {
      setStagedImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // Reset input
  };

  const startImageTimer = (msgId) => {
    if (imageTimers[msgId]) return; // Already viewed
    setViewingImageId(msgId);
    setImageTimers(prev => ({ ...prev, [msgId]: 10 }));

    const timer = setInterval(() => {
      setImageTimers(prev => {
        const next = (prev[msgId] || 10) - 1;
        if (next <= 0) {
          clearInterval(timer);
          setViewingImageId(null);

          // Persistence Fix: Permanently clear the image from message history
          setMessages(mPrev => mPrev.map((m, idx) => {
            const id = m.id || idx;
            if (id === msgId) {
              return { ...m, expired: true, text: "Snapshot Expired" };
            }
            return m;
          }));

          return { ...prev, [msgId]: 0 };
        }
        return { ...prev, [msgId]: next };
      });
    }, 1000);
  };

  const handleSpark = () => {
    setIsSparking(true);
    const randomQuestion = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

    // Smoothly type out the question
    let i = 0;
    setMessage(""); // Clear first
    const interval = setInterval(() => {
      const char = randomQuestion.substring(0, i + 1);
      setMessage(char);
      // Manually trigger typing event since we are bypassing the input's onChange
      socket.emit('typing', { roomId: chatData.roomId, senderName: currentUser });

      i++;
      if (i === randomQuestion.length) {
        clearInterval(interval);
        setIsSparking(false);
        // Stop typing indicator after finishing
        setTimeout(() => {
          socket.emit('stop-typing', { roomId: chatData.roomId });
        }, 1000);
      }
    }, 20);
  };

  const handleSaveEdit = () => {
    if (!message.trim() || !editingMessage) return;
    socket.emit('edit-message', {
      roomId: chatData.roomId,
      messageId: editingMessage.id,
      newText: message.trim()
    });
    setEditingMessage(null);
    setMessage("");
  };

  const handleClose = () => {
    socket.emit('end-chat', { roomId: chatData.roomId, senderName: currentUser });
    localStorage.removeItem(`chat_messages_${chatData.roomId}`);
    onClose();
  };

  const toggleVibeGame = () => {
    const nextState = !isGameOpen;
    socket.emit('vibe-game-toggle', { roomId: chatData.roomId, isOpen: nextState });
  };

  const sendReaction = (messageId, e, emoji = "❤️") => {
    socket.emit('vibe-reaction', {
      roomId: chatData.roomId,
      messageId,
      emoji
    });
  };

  const getCoordinates = (e) => {
    if (e.touches && e.touches[0]) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };
  };

  const startDrawing = (e) => {
    if (e.type === 'touchstart') e.preventDefault();
    const { x, y } = getCoordinates(e);
    drawingContextRef.current.beginPath();
    drawingContextRef.current.moveTo(x, y);
    setIsDrawing(true);
    socket.emit('draw-start', { roomId: chatData.roomId, x, y, color: '#6366f1' });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    const { x, y } = getCoordinates(e);
    drawingContextRef.current.lineTo(x, y);
    drawingContextRef.current.stroke();
    socket.emit('draw-move', { roomId: chatData.roomId, x, y });
  };

  const stopDrawing = (e) => {
    if (e && e.type === 'touchend') e.preventDefault();
    drawingContextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    socket.emit('draw-clear', { roomId: chatData.roomId });
  };

  useEffect(() => {
    if (isDoodleOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const context = canvas.getContext('2d');
      context.lineCap = "round";
      context.strokeStyle = "#6366f1";
      context.lineWidth = 5;
      drawingContextRef.current = context;
    }
  }, [isDoodleOpen]);

  const selectVibeEmoji = (emoji) => {
    if (mySelection || !gameState) return;
    // Check if it's my turn if first pick or if partner already picked
    // The logic in backend allows anyone to pick, so we just throttle locally
    setMySelection(emoji);
    // Find my sessionId from chatData.members? No, we use sessionId from Clerk or currentUser name.
    // In server.js we used sessionId. Let's find it.
    // Dashboard page passes sessionId to register-user.
    // We can use socket.sessionId if it was set.
    socket.emit('vibe-emoji-select', {
      roomId: chatData.roomId,
      sessionId: sessionId,
      emoji
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-3xl flex flex-col h-screen w-full overflow-hidden font-sans"
    >
      {/* --- PREMIUM HEADER --- */}
      <header className="px-8 py-6 border-b border-indigo-500/10 flex justify-between items-center bg-white/60 relative z-20">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-rose-400 to-indigo-600 rounded-[1.6rem] blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-14 h-14 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black shadow-2xl">
              {partnerDetails.name ? partnerDetails.name[0] : "?"}
            </div>
            {!partnerDetails.left && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-lg" />
            )}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-2xl tracking-tighter flex items-center gap-2">
              {partnerDetails.name}
              {partnerDetails.left && <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Left</span>}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/50" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">End-to-End Vibe Security</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => socket.emit('draw-toggle', { roomId: chatData.roomId, isOpen: !isDoodleOpen })}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${isDoodleOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={toggleVibeGame}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${isGameOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            <Sparkles size={16} className={isGameOpen ? "animate-pulse" : ""} />
            {isGameOpen ? "Close Game" : "Vibe Match"}
          </button>

          <button
            onClick={handleClose}
            className="group relative p-4 bg-white/80 hover:bg-rose-500 text-slate-400 hover:text-white rounded-[2rem] transition-all shadow-xl shadow-slate-200/50 active:scale-90"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </header>

      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-8 relative">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-rose-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-white/50">
              <Zap className="text-indigo-400 w-10 h-10" />
            </div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">The vibe is established</p>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest italic">Break the ice...</p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => {
            if (msg.system) {
              return (
                <motion.div key={`sys-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-4">
                  <div className="bg-rose-50/50 px-6 py-2 rounded-full border border-rose-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                      <AlertCircle size={12} /> {msg.text}
                    </p>
                  </div>
                </motion.div>
              );
            }

            const isMe = msg.sender === currentUser;
            const isImage = msg.type === 'image';
            const secondsLeft = imageTimers[msg.id || i];
            const isExpired = secondsLeft === 0;

            return (
              <motion.div
                key={msg.id || i}
                layout
                initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className={`flex group/msg ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* MESSAGE ACTION BAR */}
                  {!msg.deleted && !isImage && (
                    <div className={`flex gap-1 mb-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 ${isMe ? 'flex-row-reverse mr-4' : 'flex-row ml-4'}`}>
                      <button onClick={() => copyToClipboard(msg.text, msg.id || i)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors tooltip">
                        {copiedId === (msg.id || i) ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                      {isMe && (
                        <>
                          <button onClick={() => handleEditMessage(msg)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <div
                    id={`msg-bubble-${msg.id || i}`}
                    onClick={(e) => sendReaction(msg.id || i, e)}
                    className={`px-7 py-5 rounded-[2.8rem] text-[16px] font-semibold tracking-tight leading-relaxed shadow-xl border relative cursor-heart ${isMe
                      ? msg.deleted || msg.expired ? 'bg-slate-100 text-slate-400 border-slate-200 italic' : 'bg-slate-900 text-white border-transparent rounded-tr-none shadow-slate-900/10'
                      : msg.deleted || msg.expired ? 'bg-slate-50 text-slate-400 border-slate-100 italic' : 'bg-white text-slate-800 border-indigo-50 rounded-tl-none shadow-indigo-500/5'
                      }`}>
                    {isImage ? (
                      msg.expired || isExpired ? (
                        <div className="flex items-center gap-2 py-2">
                          <Clock size={16} /> Snapshot Expired
                        </div>
                      ) : viewingImageId === (msg.id || i) ? (
                        <div className="relative">
                          <img src={msg.text} alt="Snapshot" className="rounded-2xl max-w-full h-auto shadow-2xl" />
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-black px-2 py-1 rounded-full backdrop-blur-md">
                            {secondsLeft}s
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startImageTimer(msg.id || i)}
                          className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'}`}
                        >
                          <Eye size={18} /> {isMe ? "Tap to Preview" : "Tap to View Snapshot"}
                        </button>
                      )
                    ) : (
                      msg.text
                    )}
                  </div>
                  <div className={`mt-2 flex items-center gap-2 px-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-2">
                      {msg.time}
                      {msg.edited && !msg.deleted && (
                        <span className="text-indigo-400/60 lowercase">• edited</span>
                      )}
                    </span>
                    {isMe && !msg.deleted && <div className="w-3 h-3 bg-emerald-500/20 rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-emerald-500 rounded-full" /></div>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* TYPING INDICATOR */}
        <AnimatePresence>
          {isPartnerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start pl-2"
            >
              <div className="bg-white/60 backdrop-blur-md px-6 py-4 rounded-[2rem] rounded-tl-none border border-indigo-50 shadow-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{partnerDetails.name} is vibing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={scrollRef} className="h-4" />
      </div>

      <style jsx global>{`
        .cursor-heart:active { cursor: heart; }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
        }
        .reaction-heart {
          position: fixed;
          pointer-events: none;
          animation: float-up 4s ease-out forwards;
          z-index: 200;
        }
      `}</style>

      {/* REACTION PARTICLES */}
      {activeReactions.map(reaction => (
        <div
          key={reaction.id}
          className="reaction-heart text-2xl"
          style={{ left: reaction.x, top: reaction.y }}
        >
          {reaction.emoji}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: (Math.random() - 0.5) * 100, y: -200, opacity: 0 }}
                transition={{ duration: 2 + Math.random() * 2 }}
                className="absolute text-xs"
              >
                {reaction.emoji}
              </motion.span>
            ))}
          </div>
        </div>
      ))}

      {/* DOODLE CANVAS */}
      <AnimatePresence>
        {isDoodleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-white/10 backdrop-blur-sm"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
            <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-4">
              <button onClick={clearCanvas} className="bg-white p-4 rounded-full shadow-2xl text-slate-400 hover:text-rose-500 transition-all"><RotateCcw size={24} /></button>
              <button onClick={() => socket.emit('draw-toggle', { roomId: chatData.roomId, isOpen: false })} className="bg-white p-4 rounded-full shadow-2xl text-slate-400 hover:text-indigo-600 transition-all"><X size={24} /></button>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-8 py-4 rounded-full border border-white shadow-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600">
              Synced Vibe Doodle • Draw Together
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VIBE GAME OVERLAY --- */}
      <AnimatePresence>
        {isGameOpen && gameState && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8"
          >
            {/* MATCH ANIMATION */}
            <AnimatePresence>
              {showMatchAnimation && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} exit={{ scale: 0 }} className="absolute z-[60] flex flex-col items-center">
                  <div className="text-9xl shadow-2xl">💖</div>
                  <h2 className="text-4xl font-black text-indigo-600 mt-8 tracking-tighter">VIBE SYNCED!</h2>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MISS ANIMATION */}
            <AnimatePresence>
              {showMissAnimation && (
                <motion.div initial={{ rotate: 10 }} animate={{ rotate: [-10, 10, -10, 0] }} exit={{ opacity: 0 }} className="absolute z-[60] flex flex-col items-center">
                  <div className="text-9xl grayscale opacity-50">💔</div>
                  <h2 className="text-4xl font-black text-slate-400 mt-8 tracking-tighter">MISSED VIBE</h2>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center mb-12 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2 block">Round {gameState.round}</span>
              <h2 className="text-4xl font-serif italic text-slate-900 leading-tight">Match your partner's vibe...</h2>

              <div className="mt-8 flex items-center justify-center gap-4">
                <div className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${gameState.turnId === sessionId ? 'bg-indigo-500 border-indigo-500 text-white shadow-xl' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                  {gameState.turnId === sessionId ? "Your Turn" : `${partnerDetails.name}'s Turn`}
                </div>
                {partnerSelected && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                    <Check size={12} /> Partner Ready
                  </div>
                )}
              </div>
            </div>

            {lastRoundResult ? (
              <div className="flex flex-col items-center gap-10">
                <div className="flex gap-16">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">You</span>
                    <div className="text-7xl">{lastRoundResult.selections[sessionId]}</div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{partnerDetails.name}</span>
                    <div className="text-7xl">{Object.values(lastRoundResult.selections).find((e, idx) => Object.keys(lastRoundResult.selections)[idx] !== sessionId) || "?"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-2xl flex flex-col items-center">
                {(!mySelection && (gameState.turnId !== sessionId && !partnerSelected)) ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 bg-indigo-50/30 rounded-[3rem] w-full border border-indigo-100/50 backdrop-blur-sm">
                    <div className="text-4xl mb-4 animate-bounce">⏳</div>
                    <p className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                      Wait for {partnerDetails.name} to lead the vibe...
                    </p>
                  </motion.div>
                ) : (mySelection && !partnerSelected) ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 bg-emerald-50/30 rounded-[3rem] w-full border border-emerald-100/50 backdrop-blur-sm">
                    <div className="text-4xl mb-4 animate-pulse">✨</div>
                    <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">
                      Vibe cast! Waiting for {partnerDetails.name} to match...
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                    {CURATED_EMOJIS.map((emoji, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => selectVibeEmoji(emoji)}
                        disabled={mySelection !== null}
                        className={`text-4xl w-16 h-16 flex items-center justify-center rounded-3xl border-2 transition-all ${mySelection === emoji ? 'bg-indigo-600 border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-400'}`}
                      >
                        <span className={mySelection === emoji ? '' : ''}>{mySelection === emoji ? emoji : emoji}</span>
                        {mySelection === emoji && <motion.div layoutId="selection" className="absolute inset-0 rounded-3xl bg-indigo-500 -z-10" />}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={toggleVibeGame}
              className="mt-16 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-rose-500 transition-colors"
            >
              Return to Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM INPUT AREA --- */}
      <div className="p-6 md:p-8 bg-white/60 border-t border-indigo-500/10 backdrop-blur-xl relative z-30">

        {/* EMOJI PICKER OVERLAY */}
        <AnimatePresence>
          {isEmojiPickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-[110%] left-6 right-6 md:left-auto md:right-8 bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-indigo-50 grid grid-cols-7 gap-3 mb-4 max-w-sm md:max-w-md mx-auto"
            >
              {CURATED_EMOJIS.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl w-12 h-12 flex items-center justify-center hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                >
                  {emoji}
                </button>
              ))}
              <div className="col-span-1 flex items-center justify-center">
                <Heart className="text-rose-500 fill-rose-500/20" size={20} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={editingMessage ? (e) => { e.preventDefault(); handleSaveEdit(); } : handleSendMessage}
          className={`max-w-5xl mx-auto flex gap-1.5 md:gap-4 items-center bg-white p-2 md:p-3 rounded-[2rem] md:rounded-[3rem] shadow-2xl transition-all border ${partnerDetails.left ? 'opacity-50 grayscale' : 'shadow-indigo-500/5 hover:shadow-indigo-500/10 border-indigo-50'} ${editingMessage ? 'ring-2 ring-indigo-500 border-indigo-200' : ''}`}
        >
          <button
            type="button"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-full transition-all active:scale-95 ${isEmojiPickerOpen ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
          >
            <Smile size={20} className="md:w-6 md:h-6" />
          </button>

          <button
            type="button"
            onClick={handleSpark}
            disabled={isSparking || partnerDetails.left}
            className={`hidden sm:flex w-10 h-10 md:w-12 md:h-12 flex-shrink-0 items-center justify-center rounded-full transition-all active:scale-95 relative group overflow-hidden ${isSparking ? 'bg-indigo-100' : 'bg-gradient-to-tr from-indigo-50 to-rose-50 text-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'}`}
          >
            <Sparkles size={18} className={`${isSparking ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={partnerDetails.left}
            className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-full transition-all active:scale-95 bg-gradient-to-tr from-rose-50 to-indigo-50 text-rose-500 hover:shadow-lg hover:shadow-rose-500/20`}
          >
            <Camera size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="flex-1 flex flex-col relative min-w-0">
            {stagedImage && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-[120%] left-0 z-20">
                <div className="relative group">
                  <img src={stagedImage} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl border-4 border-indigo-500 shadow-2xl" />
                  <button onClick={() => setStagedImage(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform">
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            )}
            {editingMessage && (
              <div className="flex justify-between items-center px-2 py-1 bg-indigo-50/50 rounded-lg -mt-1 mb-1">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest truncate">Editing</span>
                <button onClick={cancelEdit} className="text-rose-500 hover:text-rose-600"><X size={14} /></button>
              </div>
            )}
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              disabled={partnerDetails.left}
              placeholder={partnerDetails.left ? "Left" : editingMessage ? "Edit..." : `Vibe...`}
              className="bg-transparent px-1 md:px-2 py-2 text-base md:text-lg outline-none font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium min-w-0"
            />
          </div>

          <button
            type="submit"
            disabled={(!message.trim() && !stagedImage) || partnerDetails.left}
            className={`w-11 h-11 md:w-14 md:h-14 flex-shrink-0 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${(!message.trim() && !stagedImage) || partnerDetails.left
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : editingMessage ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-indigo-500/20'
              }`}
          >
            {editingMessage ? <Check size={20} className="md:w-[22px] md:h-[22px]" /> : <Send size={20} className={`${message.trim() || stagedImage ? "translate-x-0.5 -translate-y-0.5" : ""} md:w-[22px] md:h-[22px]`} />}
          </button>
        </form>

        <div className="max-w-5xl mx-auto flex items-center justify-between mt-5 px-4 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-indigo-600" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Stealth Session</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Self-destructing Room</span>
            <Clock size={12} className="text-rose-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

