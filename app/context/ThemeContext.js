"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [vibeHue, setVibeHue] = useState(240); // Default Indigo (240)

    // Synchronize with system preference or local storage if needed
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
        } else if (savedTheme === 'light') {
            setIsDarkMode(false);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }
    }, []);

    // Update the CSS variable globally
    useEffect(() => {
        document.documentElement.style.setProperty('--vibe-hue', vibeHue);
    }, [vibeHue]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    const updateVibeHue = (count) => {
        // Shift from 240 (Indigo) to 340 (Rose) based on activity
        const newHue = Math.min(340, 240 + (count * 5));
        setVibeHue(newHue);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, vibeHue, updateVibeHue }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
