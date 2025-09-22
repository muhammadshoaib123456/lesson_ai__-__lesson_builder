"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import initializeSocketConnection, { disconnectSocket } from "./GlobalFuncs/SocketConn.js";

/**
 * Keeps a single socket connection alive for any route starting with /create-lesson
 * - Connects on entering /create-lesson*
 * - Stays connected even after downloads
 * - Disconnects only when navigating away from /create-lesson*
 *
 * NOTE:
 * - No cleanup function here — that plays badly with Fast Refresh/HMR and can
 *   disconnect/reconnect unnecessarily while you remain on the same page.
 */
export default function SocketBoundary() {
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    const onCreateLesson = pathname?.startsWith("/create-lesson");

    if (onCreateLesson) {
      initializeSocketConnection(dispatch);
    } else {
      disconnectSocket(dispatch);
    }
  }, [pathname, dispatch]);

  return null;
}
