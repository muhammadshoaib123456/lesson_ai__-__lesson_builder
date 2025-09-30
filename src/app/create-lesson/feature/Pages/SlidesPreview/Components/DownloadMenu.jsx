"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function DownloadMenu() {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");          // Slides URL (Google Slides)
  const [socketID, setSocketID] = useState("");  // component-local snapshot (storage)
  const [downloading, setDownloading] = useState(false);

  // ✅ Live Redux fallback for freshest id
  const reduxSocketId = useSelector((s) => s.socket.socketId);

  const lastUrlRef = useRef("");
  const lastSocketRef = useRef("");

  useEffect(() => {
    try {
      const url = localStorage.getItem("url") || "";
      const sid = localStorage.getItem("socketID") || "";
      setHref(url);
      setSocketID(sid);
      lastUrlRef.current = url;
      lastSocketRef.current = sid;
    } catch {}
  }, []);

  // Light polling to catch same-tab storage changes
  useEffect(() => {
    const iv = setInterval(() => {
      try {
        const curUrl = localStorage.getItem("url") || "";
        const curSid = localStorage.getItem("socketID") || "";

        if (curUrl && curUrl !== lastUrlRef.current) {
          lastUrlRef.current = curUrl;
          setHref(curUrl);
          try { localStorage.removeItem("artifactSocketID"); } catch {}
        }
        if (curSid !== lastSocketRef.current) {
          lastSocketRef.current = curSid;
          setSocketID(curSid);
        }
      } catch {}
    }, 800);
    return () => clearInterval(iv);
  }, []);

  async function handleDownloadPPT() {
    if (downloading) return;

    // Best available socket id (stable artifact -> Redux -> storage -> local state)
    let sidToUse = "";
    try {
      sidToUse =
        localStorage.getItem("artifactSocketID") ||
        reduxSocketId ||
        localStorage.getItem("socketID") ||
        socketID ||
        "";
    } catch {}

    if (!sidToUse) {
      toast.error("No socket ready yet. Please generate the slides first.");
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch(
        `/api/lesson-builder/slides/download?socketID=${encodeURIComponent(sidToUse)}`
      );

      if (!res.ok) {
        let msg = "";
        try { msg = await res.text(); } catch {}
        console.error("Download error:", { status: res.status, msg: msg?.slice?.(0, 500) || "(empty)" });
        toast.error("Download failed.");
        return;
      }

      // Pin the id that produced this artifact (stable for repeat downloads)
      try { localStorage.setItem("artifactSocketID", sidToUse); } catch {}

      let filename = "presentation.pptx";
      const cd = res.headers.get("content-disposition");
      if (cd && /filename\*=UTF-8''([^;]+)/i.test(cd)) {
        filename = decodeURIComponent(cd.match(/filename\*=UTF-8''([^;]+)/i)[1]);
      } else if (cd && /filename="?([^";]+)"?/i.test(cd)) {
        filename = cd.match(/filename="?([^";]+)"?/i)[1];
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "presentation.pptx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("download error:", err);
      toast.error("Download failed.");
    } finally {
      setDownloading(false);
      setOpen(false);
    }
  }

  function handleOpenSlides() {
    let fresh = href;
    try {
      const latest = localStorage.getItem("url");
      if (typeof latest === "string") {
        fresh = latest;
        if (fresh !== href) setHref(fresh);
      }
    } catch {}

    if (!fresh) {
      toast.error("No file available to open yet.");
      return;
    }
    window.open(fresh, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-green-500 bg-white text-green-600 hover:bg-green-50 transition-colors ${downloading ? "pointer-events-none opacity-75" : ""}`}
        aria-disabled={downloading}
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path
              fillRule="evenodd"
              d="M10.293 14.707a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414L11 12.586V3a1 1 0 10-2 0v9.586L4.707 8.293A1 1 0 003.293 9.707l5 5z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <span className="font-semibold text-sm sm:text-base">
          {downloading ? "Preparing…" : "Download"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2">
            {/* PPTX */}
            <div
              onClick={handleDownloadPPT}
              className={`flex items-start px-4 py-2 hover:bg-gray-100 cursor-pointer ${downloading ? "pointer-events-none opacity-60" : ""}`}
            >
              <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-md bg-gray-200 text-gray-700">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M13 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5z" />
                  <path d="M13 2v5h5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">PPTX</span>
                <span className="text-xs text-gray-500">Microsoft PowerPoint document</span>
              </div>
            </div>

            {/* Slides (Google Slides link) */}
            <div
              onClick={handleOpenSlides}
              className="flex items-start px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-md bg-gray-200 text-gray-700">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M3 4a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 4v-4H5a2 2 0 01-2-2V4z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Slides</span>
                <span className="text-xs text-gray-500">Google Slides</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
































// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { useDispatch } from "react-redux";
// import { disconnectSocket } from "../../../GlobalFuncs/SocketConn.js";

// /**
//  * DownloadMenu
//  *
//  * A small dropdown menu that exposes two actions: downloading a PPTX file or
//  * opening the generated presentation in Google Slides. This menu is designed to
//  * match the UI shown in the provided screenshots. When the user clicks the
//  * primary "Download" button the dropdown toggles. Clicking the "PPTX" option
//  * downloads the file via the existing API. Clicking the "Slides" option will
//  * open the generated presentation in a new browser tab (assuming the remote
//  * service returns a link that can be used directly by Google Slides). The
//  * component uses TailwindCSS classes to provide a polished look and feel.
//  */
// export default function DownloadMenu() {
//   const [open, setOpen] = useState(false);
//   const [href, setHref] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const dispatch = useDispatch();

//   // Pull the download URL from local storage once on mount. If the
//   // server provided a link earlier it will be stored under the key "url".
//   useEffect(() => {
//     try {
//       const url = localStorage.getItem("url");
//       if (url) setHref(url);
//     } catch {
//       // If localStorage is unavailable simply ignore.
//     }
//   }, []);

//   // Download the PPTX. This copies the logic from the existing DownloadButton
//   // component. It first tries to proxy the download through our API; if that
//   // fails it falls back to opening the direct link. After triggering the
//   // download we optionally disconnect the socket.
//   async function handleDownloadPPT() {
//     if (!href) {
//       toast.error("No file available to download yet.");
//       return;
//     }
//     setDownloading(true);
//     try {
//       const res = await fetch(
//         `/api/lesson-builder/slides/download?href=${encodeURIComponent(href)}`
//       );
//       if (!res.ok) {
//         // fallback: open upstream URL
//         window.open(href, "_blank", "noopener,noreferrer");
//         return;
//       }
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "slides.pptx";
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//       // Optionally free the socket once the download starts
//       try {
//         disconnectSocket(dispatch);
//       } catch {}
//     } catch (err) {
//       console.error("download error:", err);
//       toast.error("Download failed. Opening in a new tab.");
//       window.open(href, "_blank", "noopener,noreferrer");
//     } finally {
//       setDownloading(false);
//       // Hide the menu after an action completes
//       setOpen(false);
//     }
//   }

//   // Open the generated presentation in Google Slides. The assumption here is
//   // that the backend returns a link directly compatible with Google Slides.
//   // If not, this will still open the link in a new tab. We simply read the
//   // stored URL and open it.
//   function handleOpenSlides() {
//     if (!href) {
//       toast.error("No file available to open yet.");
//       return;
//     }
//     window.open(href, "_blank", "noopener,noreferrer");
//     setOpen(false);
//   }

//   return (
//     <div className="relative inline-block text-left">
//       {/* Primary button to toggle the dropdown */}
//       <button
//         type="button"
//         onClick={() => setOpen((prev) => !prev)}
//         className="flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 text-white px-4 py-2 transition-colors"
//       >
//         <span>{downloading ? "Preparing…" : "Download"}</span>
//         {/* Down arrow icon */}
//         <svg
//           className={`w-4 h-4 transform transition-transform ${open ? "rotate-180" : "rotate-0"}`}
//           viewBox="0 0 20 20"
//           fill="currentColor"
//         >
//           <path
//             fillRule="evenodd"
//             d="M10.293 14.707a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414L11 12.586V3a1 1 0 10-2 0v9.586L4.707 8.293A1 1 0 003.293 9.707l5 5z"
//             clipRule="evenodd"
//           />
//         </svg>
//       </button>
//       {/* Dropdown menu */}
//       {open && (
//         <div
//           className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
//         >
//           <div className="py-1">
//             <button
//               onClick={handleDownloadPPT}
//               className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//             >
//               PPTX
//             </button>
//             <button
//               onClick={handleOpenSlides}
//               className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//             >
//               Slides
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }