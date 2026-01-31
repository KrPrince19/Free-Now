import { io } from "socket.io-client";

// This will point to your Node.js backend later
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});