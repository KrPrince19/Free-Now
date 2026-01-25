"use client";
import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { Send, X, ShieldCheck, Clock, Smile, Sparkles, Heart, Zap, User, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CURATED_EMOJIS = ["❤️", "✨", "😂", "😍", "🔥", "🙌", "🥂", "🌟", "🌸", "🦋", "🍭", "🧸", "🦄", "🌈"];

export default function ChatBox({ chatData, currentUser, onClose }) {
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

    return () => {
      socket.off('new-message');
      socket.off('partner-typing');
      socket.off('partner-stop-typing');
      socket.off('partner-left');
      socket.off('message-updated');
      socket.off('message-deleted');
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
    if (!message.trim() || partnerDetails.left) return;

    socket.emit('send-private-message', {
      roomId: chatData.roomId,
      message: message.trim(),
      senderName: currentUser
    });

    // Stop typing immediately when message is sent
    socket.emit('stop-typing', { roomId: chatData.roomId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setMessage("");
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

        <button
          onClick={handleClose}
          className="group relative p-4 bg-white/80 hover:bg-rose-500 text-slate-400 hover:text-white rounded-[2rem] transition-all shadow-xl shadow-slate-200/50 active:scale-90"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
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
                  {!msg.deleted && (
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

                  <div className={`px-7 py-5 rounded-[2.8rem] text-[16px] font-semibold tracking-tight leading-relaxed shadow-xl border relative ${isMe
                    ? msg.deleted ? 'bg-slate-100 text-slate-400 border-slate-200 italic' : 'bg-slate-900 text-white border-transparent rounded-tr-none shadow-slate-900/10'
                    : msg.deleted ? 'bg-slate-50 text-slate-400 border-slate-100 italic' : 'bg-white text-slate-800 border-indigo-50 rounded-tl-none shadow-indigo-500/5'
                    }`}>
                    {msg.text}
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
          className={`max-w-5xl mx-auto flex gap-4 items-center bg-white p-3 rounded-[3rem] shadow-2xl transition-all border ${partnerDetails.left ? 'opacity-50 grayscale' : 'shadow-indigo-500/5 hover:shadow-indigo-500/10 border-indigo-50'} ${editingMessage ? 'ring-2 ring-indigo-500 border-indigo-200' : ''}`}
        >
          <button
            type="button"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 ${isEmojiPickerOpen ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
          >
            <Smile size={24} />
          </button>

          <div className="flex-1 flex flex-col">
            {editingMessage && (
              <div className="flex justify-between items-center px-2 py-1 bg-indigo-50/50 rounded-lg -mt-1 mb-1">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Editing Message</span>
                <button onClick={cancelEdit} className="text-rose-500 hover:text-rose-600"><X size={14} /></button>
              </div>
            )}
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              disabled={partnerDetails.left}
              placeholder={partnerDetails.left ? "Partner has disconnected" : editingMessage ? "Edit message..." : `Message ${partnerDetails.name}...`}
              className="bg-transparent px-2 py-2 text-lg outline-none font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim() || partnerDetails.left}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${!message.trim() || partnerDetails.left
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : editingMessage ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-indigo-500/20'
              }`}
          >
            {editingMessage ? <Check size={22} /> : <Send size={22} className={message.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />}
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

// Sub-component for system icons (imported in scope)
function AlertCircle({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}