"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, User, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-500 px-6 py-4 ${isDarkMode ? 'bg-[#0a0a0c]/80 border-white/10' : 'bg-white/80 border-slate-100'
      }`}>
      <div className="max-w-5xl mx-auto flex justify-between items-center">

        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <span className="text-white font-black text-xl italic">F</span>
          </div>
          <h1 className={`text-xl font-bold tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>FreeNow</h1>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2">

          {/* Theme Toggle - Always Visible */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-slate-50 border-slate-200 text-indigo-600'
              }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Desktop Nav - Hidden on Mobile */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Home Button */}
            <Link href="/">
              <button className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all ${pathname === '/'
                ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                : (isDarkMode ? 'text-white/50 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600')
                }`} title="Home">
                <Home size={20} />
              </button>
            </Link>

            {/* Sync Button */}
            <Link href="/dashboard">
              <button className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-bold text-sm ${pathname === '/dashboard'
                ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                : (isDarkMode ? 'text-white/50 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600')
                }`}>
                <RefreshCw size={18} />
                <span className="hidden md:inline">Sync</span>
              </button>
            </Link>

            {/* User Profile */}
            <Link href="/profile">
              <button className={`w-11 h-11 border rounded-full flex items-center justify-center transition-all group ml-1 ${pathname === '/profile'
                ? (isDarkMode ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-indigo-200 bg-indigo-50')
                : (isDarkMode ? 'bg-white/5 border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5' : 'bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50')
                }`} title="Profile">
                <div className="w-8 h-8 bg-gradient-to-tr from-rose-400 to-indigo-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`sm:hidden p-2 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`sm:hidden flex flex-col gap-2 rounded-2xl mt-4 p-2 border overflow-hidden ${isDarkMode ? 'bg-[#0a0a0c]/60 border-white/5' : 'bg-slate-50 border-slate-100'}`}
          >
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <button className={`flex items-center gap-4 w-full px-5 py-3 rounded-xl transition-all font-bold text-sm ${pathname === '/'
                ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                : (isDarkMode ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white hover:text-indigo-600')
                }`}>
                <Home size={18} /> Home
              </button>
            </Link>
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
              <button className={`flex items-center gap-4 w-full px-5 py-3 rounded-xl transition-all font-bold text-sm ${pathname === '/dashboard'
                ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-600/30')
                : (isDarkMode ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-50 text-indigo-600 hover:bg-white')
                }`}>
                <RefreshCw size={18} /> Sync
              </button>
            </Link>
            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
              <button className={`flex items-center gap-4 w-full px-5 py-3 rounded-xl transition-all font-bold text-sm ${pathname === '/profile'
                ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                : (isDarkMode ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white hover:text-rose-600')
                }`}>
                <div className="w-8 h-8 bg-gradient-to-tr from-rose-400 to-indigo-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                Profile
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;