"use client";

import {
  setImageData,
  setReceivedData,
  setSocketId,
} from "../Redux/slices/SocketSlice.js";
import { toast } from "react-toastify";
// IMPORTANT: this should be socket.io-client v2.4.0 (matches your server)
import io from "socket.io-client";

let socketInstance = null;
let listenersAttached = false;

export default function initializeSocketConnection(dispatch) {
  try {
    // reuse the single instance if already connected or connecting
    if (socketInstance && (socketInstance.connected || socketInstance.connecting)) {
      return socketInstance;
    }

    const url = process.env.NEXT_PUBLIC_SERVER_URL; // e.g. https://builder.lessn.ai:8085
    if (!url) {
      console.error("NEXT_PUBLIC_SERVER_URL is not set");
      toast.error("Server URL not configured.");
      return null;
    }

    const socket = io(url, {
      transports: ["polling", "websocket"],
      path: "/socket.io", // change only if your server uses a custom path
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      // do NOT force a new socket on every HMR; keep the singleton
      forceNew: false,
      // withCredentials: true, // enable only if your server requires cookies
    });

    // attach event listeners once to avoid duplicates after Fast Refresh/HMR
    if (!listenersAttached) {
      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        dispatch(setSocketId(socket.id));
      });

      socket.on("connect_error", (err) => {
        console.error("socket connect_error:", err?.message || err);
        toast.dismiss();
        toast.error("Realtime connection issue. Retrying…");
      });

      socket.on("error", (err) => {
        console.error("socket error:", err);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        // clear socketId to avoid sending stale IDs to your API routes
        dispatch(setSocketId(""));
      });

      socket.on("max_users", (message) => {
        console.warn("max_users:", message);
        toast.error("System has reached max users. Please try again later.");
        socket.disconnect();
        dispatch(setSocketId(""));
      });

      // server-emitted events from your backend
      socket.on("slide_content_created", (data) => {
        dispatch(setReceivedData(data));
      });

      socket.on("slide_image_created", (data) => {
        dispatch(setImageData(data));
      });

      listenersAttached = true;
    }

    socketInstance = socket;
    return socketInstance;
  } catch (e) {
    console.error("Socket connection error:", e);
    toast.error("Unable to connect to realtime server.");
    return null;
  }
}

/**
 * Manually disconnect the socket.
 * We will only call this when leaving /create-lesson* (see SocketBoundary).
 */
export function disconnectSocket(dispatch) {
  if (socketInstance) {
    console.log("Disconnecting socket…");
    socketInstance.disconnect();
    dispatch(setSocketId(""));
    socketInstance = null;
    listenersAttached = false;
  }
}

// Optional: expose current instance for debugging
export function getSocket() {
  return socketInstance;
}
