"use client";
import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { Send, X, ShieldCheck, Clock, Smile, Sparkles, Heart, Zap, User, Edit2, Trash2, Copy, Check, Camera, Eye, AlertCircle, Activity, Pencil, RotateCcw, Plus } from 'lucide-react';
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

const CHAT_VERSION = "6.1-STABLE";

export default function ChatBox({ chatData, currentUser, sessionId, onClose }) {
  console.log("🛠️ ChatBox Mounted | Version:", CHAT_VERSION);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`chat_messages_${chatData.roomId}`);
      const savedVersion = localStorage.getItem(`chat_version_${chatData.roomId}`);

      if (savedVersion !== CHAT_VERSION) {
        console.log("🧹 [V6.1:WIPE] Wiping stale chat storage for version update");
        localStorage.removeItem(`chat_messages_${chatData.roomId}`);
        localStorage.setItem(`chat_version_${chatData.roomId}`, CHAT_VERSION);
        return [];
      }
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState({ name: chatData.partnerName, left: false });
  const [editingMessage, setEditingMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isSparking, setIsSparking] = useState(false);
  const [viewingImageId, setViewingImageId] = useState(null);
  const [imageTimers, setImageTimers] = useState({});
  const [stagedImage, setStagedImage] = useState(null);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [partnerSelected, setPartnerSelected] = useState(false);
  const [mySelection, setMySelection] = useState(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [showMissAnimation, setShowMissAnimation] = useState(false);
  const [activeReactions, setActiveReactions] = useState([]);

  const [isDoodleOpen, setIsDoodleOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const processedClientIds = useRef(new Set());
  const earlyServerMessages = useRef(new Map());
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingContextRef = useRef(null);
  const fileInputRef = useRef();
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);
  const isSendingRef = useRef(false);

  // --- PROP-TO-REF SYNC ---
  const currentUserRef = useRef(currentUser);
  const chatDataRef = useRef(chatData);

  useEffect(() => {
    currentUserRef.current = currentUser;
    chatDataRef.current = chatData;
  }, [currentUser, chatData]);

  useEffect(() => {
    if (chatData.roomId) {
      localStorage.setItem(`chat_messages_${chatData.roomId}`, JSON.stringify(messages));
    }
  }, [messages, chatData.roomId]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    socket.on('new-message', (msg) => {
      const currentRoomId = chatDataRef.current.roomId;
      const currentUserName = currentUserRef.current;

      if (msg.roomId && msg.roomId !== currentRoomId) return;

      console.log(`📥 [V:${CHAT_VERSION}] Received:`, msg.id, "| clientId:", msg.clientId);

      setMessages((prev) => {
        // 1. HARD DEDUPLICATION (ID check)
        if (msg.id && prev.some(m => m.id === msg.id)) return prev;

        // 2. HARD DEDUPLICATION (ClientId check against HISTORY)
        if (msg.clientId && prev.some(m => m.clientId === msg.clientId && !m.optimistic)) return prev;

        const localTime = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const finalMsg = { ...msg, time: localTime, optimistic: false };

        // 3. SYNC FOR SENDER (Replacement Logic)
        if (msg.clientId) {
          const optIndex = prev.findIndex(m => m.clientId === msg.clientId);
          if (optIndex !== -1) {
            const newList = [...prev];
            newList[optIndex] = finalMsg;
            return newList;
          }

          const isMe = msg.sender?.toLowerCase() === currentUserName?.toLowerCase();
          if (isMe) {
            earlyServerMessages.current.set(msg.clientId, finalMsg);
            return prev;
          }
        }

        // 4. FALLBACK SENDER CHECK
        const isMeFallback = msg.sender?.toLowerCase() === currentUserName?.toLowerCase();
        if (isMeFallback && !msg.clientId) return prev;

        return [...prev, finalMsg];
      });

      setIsPartnerTyping(false);
    });

    socket.on('partner-typing', () => setIsPartnerTyping(true));
    socket.on('partner-stop-typing', () => setIsPartnerTyping(false));
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
      setGameState(prev => {
        // Only reset local selection if it's a brand new round
        if (!prev || prev.round !== state.round) {
          setMySelection(null);
          setPartnerSelected(false);
        }
        return state;
      });
      setLastRoundResult(null);
    });
    socket.on('vibe-partner-selected', ({ sessionId: pSessionId }) => {
      if (pSessionId !== sessionId) setPartnerSelected(true);
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
      console.log(`[REACTION] Received for identifier: ${messageId}`);
      // Find the element by the provided messageId (which should be clientId || serverId)
      const el = document.getElementById(`msg-bubble-${messageId}`);
      if (!el) {
        console.warn(`[REACTION] Could not find bubble for ${messageId}`);
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      const id = Date.now() + Math.random();
      setActiveReactions(prev => [...prev, { emoji, x, y, id }]);
      setTimeout(() => setActiveReactions(prev => prev.filter(r => r.id !== id)), 4000);
    });
    socket.on('draw-room-clear', () => {
      if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });
    socket.on('draw-partner-start', ({ x, y, color }) => {
      if (!drawingContextRef.current || !canvasRef.current) return;
      const ctx = drawingContextRef.current;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(x * canvasRef.current.width, y * canvasRef.current.height);
    });
    socket.on('draw-partner-move', ({ x, y }) => {
      if (!drawingContextRef.current || !canvasRef.current) return;
      drawingContextRef.current.lineTo(x * canvasRef.current.width, y * canvasRef.current.height);
      drawingContextRef.current.stroke();
    });
    socket.on('draw-room-toggle', ({ isOpen }) => setIsDoodleOpen(isOpen));

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
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    socket.emit('typing', { roomId: chatData.roomId, senderName: currentUser });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit('stop-typing', { roomId: chatData.roomId }), 2000);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if ((!message.trim() && !stagedImage) || partnerDetails.left || isSendingRef.current) return;

    isSendingRef.current = true;
    setIsSending(true);
    const currentText = message.trim();
    const currentImage = stagedImage;
    setMessage("");
    setStagedImage(null);
    setIsEmojiPickerOpen(false);
    setIsMobileMenuOpen(false);

    const sendPayload = (content, type) => {
      const clientId = `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticMsg = {
        id: clientId,
        clientId: clientId,
        text: content,
        sender: currentUser,
        type: type,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(),
        optimistic: true
      };

      setMessages(prev => {
        const earlyMsg = earlyServerMessages.current.get(clientId);
        if (earlyMsg) {
          earlyServerMessages.current.delete(clientId);
          return [...prev, earlyMsg];
        }
        if (prev.some(m => m.clientId === clientId)) return prev;
        return [...prev, optimisticMsg];
      });

      socket.emit('send-private-message', {
        roomId: chatData.roomId,
        message: content,
        senderName: currentUser,
        type: type,
        clientId: clientId
      });
    };

    if (currentImage) sendPayload(currentImage, 'image');
    if (currentText) sendPayload(currentText, 'text');

    socket.emit('stop-typing', { roomId: chatData.roomId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setTimeout(() => {
      isSendingRef.current = false;
      setIsSending(false);
    }, 500);
  };

  const addEmoji = (emoji) => { setMessage(prev => prev + emoji); setIsEmojiPickerOpen(false); };
  const handleEditMessage = (msg) => { setEditingMessage(msg); setMessage(msg.text); setIsEmojiPickerOpen(false); setIsMobileMenuOpen(false); };
  const cancelEdit = () => { setEditingMessage(null); setMessage(""); };
  const handleDeleteMessage = (messageId) => socket.emit('delete-message', { roomId: chatData.roomId, messageId });
  const copyToClipboard = (text, id) => navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Image too large! Max 5MB.");
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let width = img.width, height = img.height;
        if (width > height) { if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; } }
        else { if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "white"; ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        setStagedImage(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const startImageTimer = (msgId) => {
    if (imageTimers[msgId]) return;
    setViewingImageId(msgId);
    setImageTimers(prev => ({ ...prev, [msgId]: 10 }));
    const timer = setInterval(() => {
      setImageTimers(prev => {
        const next = (prev[msgId] || 10) - 1;
        if (next <= 0) {
          clearInterval(timer);
          setViewingImageId(null);
          setMessages(mPrev => mPrev.map((m) => (m.clientId || m.id) === msgId ? { ...m, expired: true, text: "Snapshot Expired" } : m));
          return { ...prev, [msgId]: 0 };
        }
        return { ...prev, [msgId]: next };
      });
    }, 1000);
  };

  const handleSpark = () => {
    setIsSparking(true);
    const randomQuestion = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    let i = 0; setMessage("");
    const interval = setInterval(() => {
      setMessage(randomQuestion.substring(0, i + 1));
      socket.emit('typing', { roomId: chatData.roomId, senderName: currentUser });
      i++;
      if (i === randomQuestion.length) {
        clearInterval(interval); setIsSparking(false);
        setTimeout(() => socket.emit('stop-typing', { roomId: chatData.roomId }), 1000);
      }
    }, 20);
  };

  const handleSaveEdit = () => {
    if (!message.trim() || !editingMessage) return;
    socket.emit('edit-message', { roomId: chatData.roomId, messageId: editingMessage.id, newText: message.trim() });
    setEditingMessage(null); setMessage("");
  };

  const handleClose = () => {
    socket.emit('end-chat', { roomId: chatData.roomId, senderName: currentUser });
    localStorage.removeItem(`chat_messages_${chatData.roomId}`);
    setIsMobileMenuOpen(false); onClose();
  };

  const toggleVibeGame = () => socket.emit('vibe-game-toggle', { roomId: chatData.roomId, isOpen: !isGameOpen });
  const sendReaction = (targetId, e) => {
    if (e) e.stopPropagation();
    console.log(`🔥 [CHAT:SEND] Emitting reaction for: ${targetId} to room: ${chatData.roomId}`);
    socket.emit('vibe-reaction', { roomId: chatData.roomId, messageId: targetId, emoji: "❤️" });
  };

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX || e.nativeEvent.offsetX + rect.left;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY || e.nativeEvent.offsetY + rect.top;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    if (!canvasRef.current) return;
    drawingContextRef.current.beginPath();
    drawingContextRef.current.moveTo(x, y);
    setIsDrawing(true);
    socket.emit('draw-start', { roomId: chatData.roomId, x: x / canvasRef.current.width, y: y / canvasRef.current.height, color: '#6366f1' });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    drawingContextRef.current.lineTo(x, y);
    drawingContextRef.current.stroke();
    socket.emit('draw-move', { roomId: chatData.roomId, x: x / canvasRef.current.width, y: y / canvasRef.current.height });
  };

  const stopDrawing = () => { drawingContextRef.current.closePath(); setIsDrawing(false); };
  const clearCanvas = () => socket.emit('draw-clear', { roomId: chatData.roomId });

  useEffect(() => {
    if (isDoodleOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = "round"; ctx.strokeStyle = "#6366f1"; ctx.lineWidth = 5;
      drawingContextRef.current = ctx;
    }
  }, [isDoodleOpen]);

  const selectVibeEmoji = (emoji) => {
    if (mySelection || !gameState) return;
    setMySelection(emoji);
    socket.emit('vibe-emoji-select', { roomId: chatData.roomId, sessionId: sessionId, emoji });
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-3xl flex flex-col h-screen w-full overflow-hidden font-sans">
      <header className="px-4 py-4 md:px-8 md:py-6 border-b border-indigo-500/10 flex justify-between items-center bg-white/60 relative z-20">
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <div className="relative group flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-tr from-rose-400 to-indigo-600 rounded-[1.2rem] md:rounded-[1.6rem] blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-[1.1rem] md:rounded-[1.5rem] flex items-center justify-center text-white text-lg md:text-xl font-black shadow-2xl">
              {partnerDetails.name ? partnerDetails.name[0] : "?"}
            </div>
            {!partnerDetails.left && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 md:w-5 md:h-5 bg-emerald-500 border-2 md:border-4 border-white rounded-full shadow-lg" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 text-lg md:text-2xl tracking-tighter flex items-center gap-2 truncate">
              {partnerDetails.name} {partnerDetails.left && <span className="text-[8px] md:text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Left</span>}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-indigo-500/50" />
              <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">
                End-to-End Vibe Security
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          <button onClick={() => socket.emit('draw-toggle', { roomId: chatData.roomId, isOpen: !isDoodleOpen })} className={`flex items-center justify-center p-3 md:px-4 md:py-3 rounded-xl md:rounded-2xl transition-all ${isDoodleOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}><Pencil size={18} /></button>
          <button onClick={toggleVibeGame} className={`flex items-center gap-2 px-3 py-3 md:px-5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${isGameOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}><Sparkles size={18} className={isGameOpen ? "animate-pulse" : ""} /><span className="hidden md:inline">{isGameOpen ? "Close Game" : "Vibe Match"}</span></button>
          <button onClick={handleClose} className="group relative p-2.5 md:p-4 bg-white/80 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl md:rounded-[2rem] transition-all shadow-lg md:shadow-xl shadow-slate-200/50"><X size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform" /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-8 relative">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-40 px-6">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-indigo-50 to-rose-50 rounded-[1.8rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 border border-white/50"><Zap className="text-indigo-400 w-8 h-8 md:w-10 md:h-10" /></div>
            <p className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.3em] md:tracking-[0.4em]">The vibe is established</p>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => {
            if (msg.system) return <motion.div key={`sys-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-4"><div className="bg-rose-50/50 px-6 py-2 rounded-full border border-rose-100/50"><p className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2"><AlertCircle size={12} /> {msg.text}</p></div></motion.div>;
            const isMe = msg.sender?.toLowerCase() === currentUser?.toLowerCase(), isImage = msg.type === 'image', secondsLeft = imageTimers[msg.clientId || msg.id], isExpired = secondsLeft === 0;
            return (
              <motion.div key={msg.clientId || msg.id || i} layout initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} className={`flex group/msg ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!msg.deleted && !isImage && (
                    <div className={`flex gap-1 mb-1 opacity-0 group-hover/msg:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse mr-4' : 'flex-row ml-4'}`}>
                      <button onClick={() => copyToClipboard(msg.text, msg.id || i)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">{copiedId === (msg.id || i) ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button>
                      {isMe && (
                        <>
                          <button onClick={() => handleEditMessage(msg)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  )}
                  {/* 🛡️ MESSAGE BUBBLE: Styled as glassmorphic bubble; reactions (hearts) on double-click were removed to prevent UI clutter */}
                  <div id={`msg-bubble-${msg.clientId || msg.id}`} className={`px-7 py-5 rounded-[2.8rem] text-[16px] font-semibold tracking-tight leading-relaxed shadow-xl border relative ${isMe ? msg.deleted || msg.expired ? 'bg-slate-100 text-slate-400 border-slate-200 italic' : 'bg-slate-900 text-white border-transparent rounded-tr-none shadow-slate-900/10' : msg.deleted || msg.expired ? 'bg-slate-50 text-slate-400 border-slate-100 italic' : 'bg-white text-slate-800 border-indigo-50 rounded-tl-none shadow-indigo-500/5'}`}>
                    {isImage ? (msg.expired || isExpired ? <div className="flex items-center gap-2 py-2"><Clock size={16} /> Snapshot Expired</div> : <button onClick={() => startImageTimer(msg.clientId || msg.id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${isMe ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'}`}>{viewingImageId === (msg.clientId || msg.id) ? <Activity size={18} className="animate-pulse" /> : <Eye size={18} />}{viewingImageId === (msg.clientId || msg.id) ? "Viewing Now..." : "View Snapshot"}</button>) : msg.text}
                  </div>
                  <div className={`mt-2 flex items-center gap-2 px-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}><span className="text-[9px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-2">{msg.time} {msg.edited && !msg.deleted && <span className="text-indigo-400/60 lowercase">• edited</span>}</span>{isMe && !msg.deleted && <div className="w-3 h-3 bg-emerald-500/20 rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-emerald-500 rounded-full" /></div>}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>{isPartnerTyping && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex justify-start pl-2"><div className="bg-white/60 backdrop-blur-md px-6 py-4 rounded-[2rem] rounded-tl-none border border-indigo-50 shadow-sm flex items-center gap-3"><div className="flex gap-1">{[0.1, 0.2, 0.3].map(d => <motion.div key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />)}</div><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{partnerDetails.name} is vibing...</span></div></motion.div>}</AnimatePresence>
        <div ref={scrollRef} className="h-4" />
      </div>

      <style jsx global>{`
        @keyframes float-up { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-200px) scale(1.5); opacity: 0; } }
        .reaction-heart { position: fixed; pointer-events: none; animation: float-up 4s ease-out forwards; z-index: 200; }
      `}</style>
      {activeReactions.map(r => <div key={r.id} className="reaction-heart text-2xl" style={{ left: r.x, top: r.y }}>{r.emoji}<div className="flex gap-1">{[...Array(5)].map((_, i) => <motion.span key={i} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: (Math.random() - 0.5) * 100, y: -200, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2 }} className="absolute text-xs">{r.emoji}</motion.span>)}</div></div>)}

      <AnimatePresence>
        {isDoodleOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] bg-white/10 backdrop-blur-sm">
            <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full cursor-crosshair touch-none" />
            <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-4">
              <button onClick={clearCanvas} className="bg-white p-4 rounded-full shadow-2xl text-slate-400 hover:text-rose-500 transition-all"><RotateCcw size={24} /></button>
              <button onClick={() => socket.emit('draw-toggle', { roomId: chatData.roomId, isOpen: false })} className="bg-white p-4 rounded-full shadow-2xl text-slate-400 hover:text-indigo-600 transition-all"><X size={24} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGameOpen && gameState && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute inset-0 z-50 bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8">
            {/* 🎮 ARCADE FEEDBACK: Display "VIBE SYNCED!" when both players pick matched emojis */}
            <AnimatePresence>{showMatchAnimation && <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} exit={{ scale: 0 }} className="absolute z-[60] flex flex-col items-center"><div className="text-9xl">💖</div><h2 className="text-4xl font-black text-indigo-600 mt-8 uppercase tracking-tighter">Vibe Synced!</h2></motion.div>}</AnimatePresence>
            {/* 💔 MISMATCH FEEDBACK: Display clear signal when vibes don't match, encouraging another try */}
            <AnimatePresence>{showMissAnimation && <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} exit={{ scale: 0 }} className="absolute z-[60] flex flex-col items-center"><div className="text-9xl">💔</div><h2 className="text-4xl font-black text-rose-500 mt-8 uppercase tracking-tighter">Vibe Mismatch</h2><p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">Keep trying, you'll find the rhythm!</p></motion.div>}</AnimatePresence>
            <div className="text-center mb-12 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2 block">Round {gameState.round}</span>
              <h2 className="text-4xl font-serif italic text-slate-900">Match your partner's vibe...</h2>
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${gameState.turnId === sessionId ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{gameState.turnId === sessionId ? "Your Turn" : `${partnerDetails.name}'s Turn`}</div>
                {partnerSelected && <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest"><Check size={12} /> Partner Ready</div>}
              </div>
            </div>
            {lastRoundResult ? (
              <div className="flex gap-16"><div className="flex flex-col items-center gap-2"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">You</span><div className="text-7xl">{lastRoundResult.selections[sessionId] || "❓"}</div></div><div className="flex flex-col items-center gap-2"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{partnerDetails.name}</span><div className="text-7xl">{Object.entries(lastRoundResult.selections).find(([sid]) => sid !== sessionId)?.[1] || "❓"}</div></div></div>
            ) : gameState.turnId === sessionId ? (
              <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                {CURATED_EMOJIS.map((emoji, idx) => (
                  <motion.button key={idx} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => selectVibeEmoji(emoji)} disabled={mySelection !== null} className={`text-4xl w-16 h-16 flex items-center justify-center rounded-3xl border-2 transition-all ${mySelection === emoji ? 'bg-indigo-600 border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-400'}`}>{emoji}</motion.button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 py-10 animate-pulse">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center">
                  <User className="text-indigo-400 w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800">Waiting for {partnerDetails.name}...</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-2">Vibe Sync in Progress</p>
                </div>
              </div>
            )}
            <button onClick={toggleVibeGame} className="mt-16 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-rose-500 transition-colors">Return to Chat</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingImageId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-8">
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50"><div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Snapshot Viewing</span><span className="text-white font-bold text-sm">Self-destructing in {imageTimers[viewingImageId]}s</span></div><button onClick={() => setViewingImageId(null)} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"><X size={24} /></button></div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-5xl w-full flex items-center justify-center">{(() => { const msg = messages.find((m) => (m.clientId || m.id) === viewingImageId); return msg ? <img src={msg.text} className="max-h-[80vh] max-w-full rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-white/10" /> : null; })()}</motion.div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xs px-6"><div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><motion.div animate={{ width: `${((imageTimers[viewingImageId] || 10) / 10) * 100}%` }} className="h-full bg-indigo-500" /></div></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 md:p-8 bg-white/60 border-t border-indigo-500/10 backdrop-blur-xl relative z-30">
        <AnimatePresence>
          {isEmojiPickerOpen && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-[110%] left-6 right-6 md:left-auto md:right-8 bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-indigo-50 grid grid-cols-7 gap-3 mb-4 max-w-sm mx-auto">
              {CURATED_EMOJIS.map((emoji, idx) => <button key={idx} onClick={() => addEmoji(emoji)} className="text-2xl w-12 h-12 flex items-center justify-center hover:bg-indigo-50 rounded-2xl transition-all">{emoji}</button>)}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={editingMessage ? (e) => { e.preventDefault(); handleSaveEdit(); } : handleSendMessage} className={`max-w-5xl mx-auto flex gap-1.5 md:gap-4 items-center bg-white p-2 rounded-[2rem] md:rounded-[3rem] shadow-2xl border ${partnerDetails.left ? 'opacity-50 grayscale' : 'border-indigo-50'}`}>
          <button type="button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400"><Plus size={20} className={isMobileMenuOpen ? 'rotate-45 text-rose-500' : ''} /></button>
          <AnimatePresence>
            {(isMobileMenuOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-1.5 md:gap-4">
                <button type="button" onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all flex items-center justify-center ${isEmojiPickerOpen ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}><Smile size={20} /></button>
                <button type="button" onClick={handleSpark} disabled={isSparking} className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-500"><Sparkles size={18} /></button>
                <button type="button" onClick={() => fileInputRef.current.click()} className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-rose-50 text-rose-500"><Camera size={18} /></button>
              </motion.div>
            )}
          </AnimatePresence>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <div className="flex-1 flex flex-col relative min-w-0">
            {stagedImage && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-[120%] left-0"><img src={stagedImage} className="w-16 h-16 object-cover rounded-2xl border-4 border-indigo-500 shadow-2xl" /><button onClick={() => setStagedImage(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1"><X size={12} /></button></motion.div>}
            <input type="text" value={message} onChange={handleInputChange} disabled={partnerDetails.left} placeholder="Vibe..." className="bg-transparent px-2 py-2 text-base md:text-lg outline-none font-bold text-slate-800 w-full" />
          </div>
          <button type="submit" disabled={(!message.trim() && !stagedImage) || partnerDetails.left} className="w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-slate-900 text-white shadow-xl"><Send size={20} /></button>
        </form>
        <div className="max-w-5xl mx-auto flex items-center justify-between mt-5 px-4 opacity-30"><div className="flex items-center gap-2"><ShieldCheck size={12} className="text-indigo-600" /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Stealth Session</span></div><div className="flex items-center gap-2"><span className="text-[9px] font-black uppercase tracking-[0.2em]">Self-destructing Room</span><Clock size={12} className="text-rose-500" /></div></div>
      </div>
    </motion.div>
  );
}