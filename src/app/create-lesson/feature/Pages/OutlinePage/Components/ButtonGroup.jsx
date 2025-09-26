"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
// Use the same import path you provided
import { disconnectSocket } from "../../../GlobalFuncs/SocketConn";

/**
 * ButtonGroup
 *
 * Renders the three primary actions for the outline page: cancel, regenerate and
 * generate. Styling follows the provided UI spec.
 */
export default function ButtonGroup({ genSlides, onRegenerate }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [cancelling, setCancelling] = useState(false);
  const backHandledRef = useRef(false); // guard against double-handling popstate

  const clearPrevRunArtifacts = useCallback(() => {
    try {
      localStorage.removeItem("url");              // old Google Slides link
      localStorage.removeItem("artifactSocketID"); // pinned id used by PPTX downloads
      localStorage.removeItem("socketID");         // live id snapshot
    } catch {}
  }, []);

  const resetAndGoToCreateLesson = useCallback(() => {
    if (backHandledRef.current) return; // prevent re-entrancy
    backHandledRef.current = true;

    // 1) Clear artifacts from the current run
    clearPrevRunArtifacts();

    // 2) Disconnect current socket so next page gets a NEW socket id
    try { disconnectSocket(dispatch); } catch {}

    // 3) Navigate to create-lesson (fresh flow)
    router.replace("/create-lesson");
  }, [clearPrevRunArtifacts, dispatch, router]);

  const handleCancel = useCallback(() => {
    if (cancelling) return; // guard against double clicks
    setCancelling(true);
    resetAndGoToCreateLesson();
    // no need to unset cancelling; we're leaving the page
  }, [cancelling, resetAndGoToCreateLesson]);

  // Make the BROWSER BACK button behave like Cancel
  useEffect(() => {
    // Push a guard state so the next Back triggers a popstate we control
    try {
      window.history.pushState({ guard: "outline" }, "", window.location.href);
    } catch {}

    const onPopState = () => {
      if (backHandledRef.current) return;
      resetAndGoToCreateLesson();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [resetAndGoToCreateLesson]);

  return (
    // The container aligns the three buttons to the right and spaces them evenly.
    <div className="w-full flex justify-end space-x-4">
      {/* Cancel (now a button that fully resets session, styled like your link) */}
      <button
        type="button"
        onClick={handleCancel}
        className="flex items-center px-4 py-2 text-purple-700 hover:text-purple-900 text-sm font-semibold"
        title="Cancel and return to Create Lesson"
        aria-disabled={cancelling}
      >
        Cancel
      </button>

      {/* Regenerate Slides (unchanged) */}
      <button
        type="button"
        onClick={onRegenerate}
        className="px-5 py-2 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-sm font-semibold transition-colors"
      >
        Regenerate Slides
      </button>

      {/* Generate Slides (unchanged) */}
      <button
        type="button"
        onClick={genSlides}
        className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
      >
        Generate Slides
      </button>
    </div>
  );
}
