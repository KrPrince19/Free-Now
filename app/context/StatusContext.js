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

  // Re-sync with server on mount/auth load
  useEffect(() => {
    if (isLoaded && sessionId && isFree) {
      socket.emit("go-free", {
        id: sessionId,
        name: user?.username || user?.firstName || "Guest",
        status: statusText
      });
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
    <StatusContext.Provider value={{ isFree, statusText, setStatusText: handleSetStatusText, toggleStatus }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => useContext(StatusContext);