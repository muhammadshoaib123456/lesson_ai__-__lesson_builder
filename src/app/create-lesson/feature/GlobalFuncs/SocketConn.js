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
  // remove trailing slash(s)
  return raw.replace(/\/+$/, "");
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

    const rawUrl = process.env.NEXT_PUBLIC_SERVER_URL; // e.g. https://builder.lessn.ai:8085
    const baseUrl = normalizeUrl(rawUrl);
    if (!baseUrl) {
      console.error("[SOCKET] NEXT_PUBLIC_SERVER_URL is not set");
      safeToastError("Server URL not configured.");
      return null;
    }

    // Create (or reuse) the connection promise; useful if a caller needs to await readiness
    if (!connectPromise) {
      connectPromise = new Promise((resolve) => {
        const socket = io(baseUrl, {
          // Prefer websocket for speed/reliability; fallback to polling
          transports: ["websocket", "polling"],
          path: "/socket.io", // keep in sync with server
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 800,
          reconnectionDelayMax: 6000,
          timeout: 20000,
          forceNew: false,
          // If your server requires cookies or auth headers, set withCredentials here
          // withCredentials: true,
        });

        // Attach listeners once per process lifetime
        if (!listenersAttached) {
          socket.on("connect", () => {
            const id = socket.id;
            console.log("[SOCKET] connected →", id);
            dispatch(setSocketId(id));
            try { localStorage.setItem("socketID", id); } catch {}
            resolve(socket);
          });

          socket.on("connect_error", (err) => {
            console.error("[SOCKET] connect_error:", err?.message || err);
            safeToastError("Realtime connection issue. Retrying…");
            try { localStorage.removeItem("socketID"); } catch {}
          });

          socket.on("error", (err) => {
            console.error("[SOCKET] error:", err);
          });

          socket.on("disconnect", (reason) => {
            console.log("[SOCKET] disconnected:", reason);
            dispatch(setSocketId(""));
            try { localStorage.removeItem("socketID"); } catch {}
          });

          // v2 client fires "reconnect" on successful reconnection
          socket.io?.on?.("reconnect", () => {
            if (socket.id) {
              console.log("[SOCKET] reconnected →", socket.id);
              dispatch(setSocketId(socket.id));
              try { localStorage.setItem("socketID", socket.id); } catch {}
            }
          });

          // Optional server capacity guard
          socket.on("max_users", (message) => {
            console.warn("[SOCKET] max_users:", message);
            safeToastError("System has reached max users. Please try again later.");
            socket.disconnect();
            dispatch(setSocketId(""));
            try { localStorage.removeItem("socketID"); } catch {}
          });

          // ---- Slide events from server ----
          socket.on("slide_content_created", (data) => {
            // Defensive: server may send a full array or an incremental update
            if (!data) return;
            // Expect array of { title, content, notes, slide? } OR your known shape
            dispatch(setReceivedData(data));
          });

          socket.on("slide_image_created", (data) => {
            if (!data) return;
            // Expect array or one payload; your reducer should handle merge/replace as designed
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
 * Gracefully disconnect. Call on route exit if you want a fresh socket next time.
 */
export function disconnectSocket(dispatch) {
  if (socketInstance) {
    console.log("[SOCKET] disconnecting…");
    try {
      socketInstance.disconnect();
    } catch (e) {
      console.warn("[SOCKET] disconnect error:", e);
    }
  }
  dispatch?.(setSocketId(""));
  try { localStorage.removeItem("socketID"); } catch {}
  socketInstance = null;
  listenersAttached = false;
  connectPromise = null;
}

/**
 * Return current socket instance (may be null if not initialized).
 */
export function getSocket() {
  return socketInstance;
}

/**
 * Await until socket is connected (optional helper).
 * Usage:
 *   const sock = await waitForSocketConnected(dispatch);
 */
export async function waitForSocketConnected(dispatch) {
  const sock = initializeSocketConnection(dispatch);
  // If we already have a connected instance, return it
  if (sock?.connected) return sock;
  try {
    const s = await (connectPromise || Promise.resolve(sock));
    return s;
  } catch {
    return getSocket();
  }
}
