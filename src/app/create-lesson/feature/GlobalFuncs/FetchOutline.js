import { setOutline } from "../Redux/slices/OutlineSlice.js";
import { toast } from "react-toastify";

/**
 * FetchOutline
 * @param {string} socketId
 * @param {string} reqPrompt
 * @param {string|number} grade
 * @param {number} slides
 * @param {(boolean)=>void} setLoading
 * @param {(string)=>void} setQueueStatus
 * @param {(action)=>void} dispatch
 * @param {string} subject
 * @param {object} options - { quiet?: boolean }  quiet=true => no toasts for precondition/refresh cases
 * @returns {Promise<{ok:true, outline:any[]} | {ok:false, error:string, fields?:string[]}>}
 */
export default async function FetchOutline(
  socketId,
  reqPrompt,
  grade,
  slides,
  setLoading,
  setQueueStatus,
  dispatch,
  subject,
  options = {}
) {
  const { quiet = false } = options;

  setLoading?.(true);

  // --- Pre-flight check: bail out silently (or soft) if required fields are missing ---
  const missing = [];
  if (!socketId) missing.push("socketId");
  if (!reqPrompt) missing.push("reqPrompt");
  if (!grade && grade !== 0) missing.push("grade");
  if (!subject) missing.push("subject");

  if (missing.length) {
    setLoading?.(false);
    if (!quiet) {
      toast.error(
        `Please fill the required fields: ${missing.join(", ")}.`
      );
    }
    return { ok: false, error: "MISSING_FIELDS", fields: missing };
  }

  try {
    // Kick off the job on your Next.js API proxy
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
      }),
    });

    if (!response.ok) {
      const errorData = await safeJson(response);
      const message =
        errorData?.error ||
        (response.status === 400 ? "Missing required fields" : "Failed to create outline job");

      // On quiet mode, don’t toast; let caller decide (e.g., first page load/refresh)
      if (!quiet) toast.error(`Error creating outline: ${message}`);
      setLoading?.(false);

      // Map common server error → structured result
      if (/missing required fields/i.test(message)) {
        return { ok: false, error: "MISSING_FIELDS" };
      }
      return { ok: false, error: message };
    }

    const data = await response.json();

    if (data.job_id) {
      // count this job towards the free quota (best-effort)
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
      toast.error(
        `Error fetching outline. Please try again later. ${e?.message || ""}`
      );
    }
    return { ok: false, error: e?.message || "UNKNOWN_ERROR" };
  }
}

// ---- helpers ----
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
          if (!quiet)
            toast.error("Outline generation failed. Please try again later.");
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
        toast.error(
          `Error checking job status. Please try again later. ${e.message || ""}`
        );
      }
      return { ok: false, error: e?.message || "STATUS_ERROR" };
    }
  }

  // Timeout
  setLoading?.(false);
  if (!quiet) toast.error("Outline generation timed out. Please try again later.");
  return { ok: false, error: "TIMEOUT" };
}

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
  return new Promise((r) => setTimeout(r, ms));
}
