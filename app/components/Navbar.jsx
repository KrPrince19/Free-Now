"use client";
import React from 'react';
import Link from 'next/link';
import { Home, Compass, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ }) => {
  const { isDarkMode, toggleTheme } = useTheme();

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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`mr-2 p-2 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-slate-50 border-slate-200 text-indigo-600'
              }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Home Button */}
          <Link href="/">
            <button className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all ${isDarkMode ? 'text-white/50 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
              }`} title="Home">
              <Home size={20} />
            </button>
          </Link>

          {/* Dashboard / Find People */}
          <Link href="/dashboard">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-bold text-sm ${isDarkMode ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}>
              <Compass size={18} />
              <span className="hidden sm:inline">Explorer</span>
            </button>
          </Link>

          {/* User Profile */}
          <Link href="/profile">
            <button className={`flex items-center gap-2 p-1 pr-3 border rounded-full transition-all group ml-1 ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5' : 'bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50'
              }`}>
              <div className="w-8 h-8 bg-gradient-to-tr from-rose-400 to-indigo-500 rounded-full border-2 border-white shadow-sm" />
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white/70 group-hover:text-rose-400' : 'text-slate-600 group-hover:text-rose-600'}`}>Profile</span>
            </button>
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;