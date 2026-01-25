import { io } from "socket.io-client";

// This will point to your Node.js backend later
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});