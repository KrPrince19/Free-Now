"use client";
import React, { createContext, useContext, useState } from 'react';
import { socket } from '../lib/socket';
import { useAuth, useUser } from "@clerk/nextjs";

const StatusContext = createContext();

export const StatusProvider = ({ children }) => {
  const { sessionId, isLoaded } = useAuth();
  const { user } = useUser();
  const [isFree, setIsFree] = useState(false);
  const [statusText, setStatusText] = useState("");

  // TIMER LOGIC REMOVED: Status stays until manual toggle
  const toggleStatus = (val, text = "") => {
    if (!isLoaded || !sessionId) return;

    if (val) {
      // SET FREE: Stays active indefinitely
      socket.emit("go-free", { 
        id: sessionId, 
        name: user?.firstName || "Guest", 
        status: text 
      });
      setIsFree(true);
      setStatusText(text);
    } else {
      // SET BUSY: Manual turn off
      socket.emit("go-busy", { id: sessionId });
      setIsFree(false);
    }
  };

  return (
    <StatusContext.Provider value={{ isFree, statusText, setStatusText, toggleStatus }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => useContext(StatusContext);