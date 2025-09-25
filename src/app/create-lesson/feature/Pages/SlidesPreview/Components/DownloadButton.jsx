// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// // optional: disconnect socket after starting download
// import { useDispatch } from "react-redux";
// import { disconnectSocket } from "../../../GlobalFuncs/SocketConn.js";

// export default function DownloadButton() {
//   const [href, setHref] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     try {
//       const url = localStorage.getItem("url");
//       if (url) setHref(url);
//     } catch {}
//   }, []);

//   async function handleDownload() {
//     if (!href) {
//       toast.error("No file available to download yet.");
//       return;
//     }
//     setDownloading(true);
//     try {
//       // Try proxy first
//       const res = await fetch(`/api/lesson-builder/slides/download?href=${encodeURIComponent(href)}`);
//       if (!res.ok) {
//         // fallback: open upstream URL
//         window.open(href, "_blank", "noopener,noreferrer");
//         return;
//       }
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       // let server pick filename; use default here
//       a.download = "slides.pptx";
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);

//       // Optional: after download starts, free the socket
//       try { disconnectSocket(dispatch); } catch {}
//     } catch (err) {
//       console.error("download error:", err);
//       toast.error("Download failed. Opening in a new tab.");
//       window.open(href, "_blank", "noopener,noreferrer");
//     } finally {
//       setDownloading(false);
//     }
//   }

//   return (
//     <button
//       type="button"
//       onClick={handleDownload}
//       disabled={!href || downloading}
//       className="btn rounded-full bg-green-primary hover:bg-indigo-secondary text-white px-5 py-2"
//       title={href ? "Download your slides" : "Slides not ready yet"}
//     >
//       {downloading ? "Preparing…" : "Download Slides"}
//     </button>
//   );
// }
