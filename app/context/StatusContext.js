"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../lib/socket';
import { useAuth, useUser } from "@clerk/nextjs";

const StatusContext = createContext();

export const StatusProvider = ({ children }) => {
  const { sessionId, isLoaded } = useAuth();
  const { user } = useUser();
  const [isFree, setIsFree] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vibe_isFree') === 'true';
    }
    return false;
  });
  const [statusText, setStatusText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vibe_statusText') || "";
    }
    return "";
  });

  const [usage, setUsage] = useState({ requestsToday: 0, goFreeToday: 0, isPremium: false });

  // Re-sync with server on mount/auth load
  useEffect(() => {
    if (isLoaded && sessionId) {
      if (isFree) {
        socket.emit("go-free", {
          id: sessionId,
          name: user?.username || user?.firstName || "Guest",
          status: statusText
        });
      }

      // 💰 MONETIZATION: Listen for real-time usage updates from the server
      const handleUsageUpdate = (data) => {
        console.log("📊 [FRONTEND] Received usage update:", data);
        setUsage(data);
      };

      // Explicitly ask for latest stats on mount
      socket.emit("usage-refresh", sessionId);

      // 💎 PREMIUM SYNC: Listen for admin-triggered premium status changes
      const handlePremiumToggle = (data) => {
        if (data.email === user?.primaryEmailAddress?.emailAddress) {
          setUsage(prev => ({ ...prev, isPremium: data.isPremium }));
        }
      };

      // ♻️ USAGE SYNC: Listen for admin-triggered usage resets
      const handleUsageReset = (data) => {
        if (data.email === user?.primaryEmailAddress?.emailAddress) {
          setUsage(prev => ({ ...prev, requestsToday: 0, goFreeToday: 0 }));
        }
      };

      socket.on("usage-update", handleUsageUpdate);
      socket.on("admin-premium-toggle", handlePremiumToggle);
      socket.on("admin-usage-reset", handleUsageReset);

      return () => {
        socket.off("usage-update", handleUsageUpdate);
        socket.off("admin-premium-toggle", handlePremiumToggle);
        socket.off("admin-usage-reset", handleUsageReset);
      };
    }
  }, [isLoaded, sessionId, isFree, user]);

  // TIMER LOGIC REMOVED: Status stays until manual toggle
  const toggleStatus = (val, text = "") => {
    if (!isLoaded || !sessionId) return;

    if (val) {
      // SET FREE: Stays active indefinitely
      socket.emit("go-free", {
        id: sessionId,
        name: user?.username || user?.firstName || "Guest",
        status: text
      });
      setIsFree(true);
      setStatusText(text);
      localStorage.setItem('vibe_isFree', 'true');
      localStorage.setItem('vibe_statusText', text);
    } else {
      // SET BUSY: Manual turn off
      socket.emit("go-busy", { id: sessionId });
      setIsFree(false);
      localStorage.setItem('vibe_isFree', 'false');
    }
  };

  const handleSetStatusText = (text) => {
    setStatusText(text);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibe_statusText', text);
    }
  };

  return (
    <StatusContext.Provider value={{ isFree, statusText, usage, setStatusText: handleSetStatusText, toggleStatus }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => useContext(StatusContext);