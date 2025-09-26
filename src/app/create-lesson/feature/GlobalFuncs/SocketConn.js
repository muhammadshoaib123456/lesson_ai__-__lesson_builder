// app/GlobalFuncs/SocketConn.js
"use client";

import { setImageData, setReceivedData, setSocketId } from "../Redux/slices/SocketSlice.js";
import { toast } from "react-toastify";
// IMPORTANT: socket.io-client v2.4.0 to match your server
import io from "socket.io-client";

let socketInstance = null;
let listenersAttached = false;

export default function initializeSocketConnection(dispatch) {
  try {
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
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
    });

    if (!listenersAttached) {
      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        dispatch(setSocketId(socket.id));
        try { localStorage.setItem("socketID", socket.id); } catch {}
      });

      socket.on("connect_error", (err) => {
        console.error("socket connect_error:", err?.message || err);
        toast.dismiss();
        toast.error("Realtime connection issue. Retrying…");
        try { localStorage.removeItem("socketID"); } catch {}
      });

      socket.on("error", (err) => {
        console.error("socket error:", err);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        dispatch(setSocketId(""));
        try { localStorage.removeItem("socketID"); } catch {}
      });

      // ensure we refresh stored id on reconnect
      socket.io?.on?.("reconnect", () => {
        if (socket.id) {
          dispatch(setSocketId(socket.id));
          try { localStorage.setItem("socketID", socket.id); } catch {}
        }
      });

      socket.on("max_users", (message) => {
        console.warn("max_users:", message);
        toast.error("System has reached max users. Please try again later.");
        socket.disconnect();
        dispatch(setSocketId(""));
        try { localStorage.removeItem("socketID"); } catch {}
      });

      // server events
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

export function disconnectSocket(dispatch) {
  if (socketInstance) {
    console.log("Disconnecting socket…");
    socketInstance.disconnect();
    dispatch(setSocketId(""));
    try { localStorage.removeItem("socketID"); } catch {}
    socketInstance = null;
    listenersAttached = false;
  }
}

export function getSocket() {
  return socketInstance;
}
