// app/GlobalFuncs/SocketConn.js
"use client";

import { setImageData, setReceivedData, setSocketId } from "../Redux/slices/SocketSlice.js";
import { toast } from "react-toastify";
// IMPORTANT: install EXACTLY socket.io-client@2.4.0 to match a v2.x server
//   npm i socket.io-client@2.4.0
import io from "socket.io-client";

let socketInstance = null;
let listenersAttached = false;
let connectPromise = null;
let lastToastAt = 0;

function safeToastError(msg) {
  const now = Date.now();
  if (now - lastToastAt > 2500) {
    toast.dismiss();
    toast.error(msg);
    lastToastAt = now;
  }
}

function normalizeUrl(raw) {
  if (!raw) return "";
  return raw.replace(/\/+$/, ""); // remove trailing slashes
}

/**
 * Initialize (or return existing) socket connection.
 * Idempotent. You can call this in a top-level layout or per page mount.
 * Returns the live socket instance (and ensures a connect attempt has started).
 */
export default function initializeSocketConnection(dispatch) {
  try {
    if (socketInstance && (socketInstance.connected || socketInstance.connecting)) {
      return socketInstance;
    }

    const rawUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    const baseUrl = normalizeUrl(rawUrl);
    if (!baseUrl) {
      console.error("[SOCKET] NEXT_PUBLIC_SERVER_URL is not set");
      safeToastError("Server URL not configured.");
      return null;
    }

    if (!connectPromise) {
      connectPromise = new Promise((resolve) => {
        const socket = io(baseUrl, {
          transports: ["websocket", "polling"],
          path: "/socket.io",
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 800,
          reconnectionDelayMax: 6000,
          timeout: 20000,
          forceNew: false,
        });

        if (!listenersAttached) {
          socket.on("connect", () => {
            const id = socket.id;
            console.log("[SOCKET] connected →", id);
            dispatch(setSocketId(id));
            try {
              localStorage.setItem("socketID", id);
            } catch {}
            resolve(socket);
          });

          socket.on("connect_error", (err) => {
            console.error("[SOCKET] connect_error:", err?.message || err);
            safeToastError("Realtime connection issue. Retrying…");
            try {
              localStorage.removeItem("socketID");
            } catch {}
          });

          socket.on("error", (err) => {
            console.error("[SOCKET] error:", err);
          });

          socket.on("disconnect", (reason) => {
            console.log("[SOCKET] disconnected:", reason);
            dispatch(setSocketId(""));
            try {
              localStorage.removeItem("socketID");
            } catch {}
          });

          socket.io?.on?.("reconnect", () => {
            if (socket.id) {
              console.log("[SOCKET] reconnected →", socket.id);
              dispatch(setSocketId(socket.id));
              try {
                localStorage.setItem("socketID", socket.id);
              } catch {}
            }
          });

          socket.on("max_users", (message) => {
            console.warn("[SOCKET] max_users:", message);
            safeToastError("System has reached max users. Please try again later.");
            socket.disconnect();
            dispatch(setSocketId(""));
            try {
              localStorage.removeItem("socketID");
            } catch {}
          });

          // ---- Slide events ----
          socket.on("slide_content_created", (data) => {
            if (!data) return;
            dispatch(setReceivedData(data));
          });

          socket.on("slide_image_created", (data) => {
            if (!data) return;
            dispatch(setImageData(data));
          });

          listenersAttached = true;
        }

        socketInstance = socket;
      });
    }

    return socketInstance;
  } catch (e) {
    console.error("[SOCKET] initialization error:", e);
    safeToastError("Unable to connect to realtime server.");
    return null;
  }
}

/**
 * Gracefully disconnect. Safe with or without dispatch.
 */
export function disconnectSocket(dispatch) {
  if (socketInstance) {
    try {
      console.log("[SOCKET] disconnecting…");
      socketInstance.disconnect();
    } catch (e) {
      console.warn("[SOCKET] disconnect error:", e);
    }
  }

  if (typeof dispatch === "function") {
    dispatch(setSocketId(""));
  }

  try {
    localStorage.removeItem("socketID");
  } catch {}

  socketInstance = null;
  listenersAttached = false;
  connectPromise = null;
}

/**
 * Return current socket instance (may be null).
 */
export function getSocket() {
  return socketInstance;
}

/**
 * Await until socket is connected (optional helper).
 */
export async function waitForSocketConnected(dispatch) {
  const sock = initializeSocketConnection(dispatch);
  if (sock?.connected) return sock;
  try {
    const s = await (connectPromise || Promise.resolve(sock));
    return s;
  } catch {
    return getSocket();
  }
}
