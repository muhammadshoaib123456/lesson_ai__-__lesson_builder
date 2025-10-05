/*
 * fetchoutline.js
 *
 * Helper function for generating a lesson outline.  This function
 * encapsulates the logic for POSTing to our Next.js API route and
 * subsequently polling for job completion.  It returns either the
 * outline on success or an error object on failure.
 */

import { setOutline } from "../Redux/slices/OutlineSlice.js";
import { toast } from "react-toastify";

export default async function FetchOutline(
  socketId,
  reqPrompt,
  grade,
  slides,
  setLoading,
  setQueueStatus,
  dispatch,
  subject,
  chosenStandard = "",
  comments = "",
  curriculumPoint = "",
  options = {}
) {
  const { quiet = false } = options;
  setLoading?.(true);

  // Pre‑flight check for missing fields
  const missing = [];
  if (!socketId) missing.push("socketId");
  if (!reqPrompt) missing.push("reqPrompt");
  if (!grade && grade !== 0) missing.push("grade");
  if (!subject) missing.push("subject");
  if (missing.length) {
    setLoading?.(false);
    if (!quiet) {
      toast.error(`Please fill the required fields: ${missing.join(", ")}.`);
    }
    return { ok: false, error: "MISSING_FIELDS", fields: missing };
  }
  try {
    const response = await fetch("/api/lesson-builder/outline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        socketId,
        reqPrompt,
        grade,
        subject,
        slides: slides ?? 10,
        chosenStandard,
        comments,
        curriculumPoint,
      }),
    });
    if (!response.ok) {
      const errorData = await safeJson(response);
      const message =
        errorData?.error ||
        (response.status === 400
          ? "Missing required fields"
          : "Failed to create outline job");
      if (!quiet) toast.error(`Error creating outline: ${message}`);
      setLoading?.(false);
      if (/missing required fields/i.test(message)) {
        return { ok: false, error: "MISSING_FIELDS" };
      }
      return { ok: false, error: message };
    }
    const data = await response.json();
    if (data.job_id) {
      // count this job towards the free quota (best effort)
      fetch("/api/lesson-builder/usage", { method: "POST" }).catch(() => {});
      const pollResult = await pollForStatus(
        data.job_id,
        setLoading,
        setQueueStatus,
        dispatch,
        quiet
      );
      return pollResult;
    } else {
      setLoading?.(false);
      if (!quiet) toast.error("No job_id returned from server");
      return { ok: false, error: "NO_JOB_ID" };
    }
  } catch (e) {
    console.error("Error in FetchOutline:", e);
    setLoading?.(false);
    if (!quiet) {
      toast.error(`Error fetching outline. Please try again later. ${e?.message || ""}`);
    }
    return { ok: false, error: e?.message || "UNKNOWN_ERROR" };
  }
}

// Poll the backend for job status until complete.  Returns the outline on
// success or an error object on failure.
async function pollForStatus(jobId, setLoading, setQueueStatus, dispatch, quiet) {
  const pollInterval = 5000; // 5s
  const maxAttempts = 60; // ~5 minutes
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const statusResponse = await fetch(
        `/api/lesson-builder/outline/status/${encodeURIComponent(jobId)}`,
        { cache: "no-store" }
      );
      if (!statusResponse.ok) {
        const errorData = await safeJson(statusResponse);
        const message = errorData?.error || "Failed to fetch job status";
        throw new Error(message);
      }
      const statusData = await statusResponse.json();
      switch (statusData.status) {
        case "queued":
          setQueueStatus?.("Awaiting in queue");
          break;
        case "started":
          setQueueStatus?.("Generating outline…");
          break;
        case "finished": {
          setQueueStatus?.("Outline generated");
          const outline = normalizeOutline(statusData.outline);
          if (!outline) {
            throw new Error("Malformed outline payload");
          }
          dispatch?.(setOutline(outline));
          setLoading?.(false);
          return { ok: true, outline };
        }
        case "failed":
          setLoading?.(false);
          if (!quiet) toast.error("Outline generation failed. Please try again later.");
          return { ok: false, error: "JOB_FAILED" };
        default:
          console.warn(`Unknown status: ${statusData.status}`);
      }
      await delay(pollInterval);
      attempts++;
    } catch (e) {
      console.error("Error checking job status:", e);
      setLoading?.(false);
      if (!quiet) {
        toast.error(`Error checking job status. Please try again later. ${e.message || ""}`);
      }
      return { ok: false, error: e?.message || "STATUS_ERROR" };
    }
  }
  setLoading?.(false);
  if (!quiet) toast.error("Outline generation timed out. Please try again later.");
  return { ok: false, error: "TIMEOUT" };
}

// Convert the payload into an array if possible
function normalizeOutline(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  try {
    const parsed = JSON.parse(payload);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}