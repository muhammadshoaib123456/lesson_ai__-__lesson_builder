"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import LargeTile from "./Components/LargeTile.jsx";
import SmallTile from "./Components/SmallTile.jsx";
import SmallTable from "./Components/SmallTable.jsx";
import LargeTable from "./Components/LargeTable.jsx";
import Bar from "./Components/Bar.jsx";
import SmallTitle from "./Components/SmallTitle.jsx";
import LargeTitle from "./Components/LargeTitle.jsx";
import DownloadMenu from "./Components/DownloadMenu.jsx";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { setAvailability, setLoading } from "../../Redux/slices/DownloadSlice.js";

// OPTIONAL: if you have these actions you can import & dispatch to clear Redux socket/slide data.
// import { setSocketId, setReceivedData, setImageData } from "../../Redux/slices/SocketSlice.js";
import { disconnectSocket } from "../../GlobalFuncs/SocketConn.js";

export default function SlidesPreview({ setFinalModal }) {
  const slidesData = useSelector((state) => state.outline.outline);
  const socketId = useSelector((state) => state.socket.socketId);
  const slidesRes = useSelector((state) => state.socket.receivedData);
  const slidesResImages = useSelector((state) => state.socket.imageData);
  const { reqPrompt, grade, slides } = useSelector((state) => state.promptData);
  const { loading } = useSelector((state) => state.download);

  const [selected, setSelected] = useState(0);
  const [titles, setTitles] = useState([]);
  const [notes, setNotes] = useState([]);

  const tileRefs = useRef([]);
  const sentRef = useRef(false);
  const slideRef = useRef(null);

  // Track in-flight fetches + cancellation state
  const abortersRef = useRef([]);
  const canceledRef = useRef(false);

  // Prevent handling browser back more than once
  const backHandledRef = useRef(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const getTitles = (data) =>
    Array.isArray(data) ? data.map((d) => d?.title ?? "") : [];
  const getNotes = (data) =>
    Array.isArray(data) ? data.map((d) => d?.notes ?? "") : [];

  const totalSlides = useMemo(() => (slidesRes?.length ?? 0) + 2, [slidesRes]);

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const onSliderChange = (val) =>
    setSelected(clamp(parseInt(val, 10), 0, Math.max(totalSlides - 1, 0)));

  // Hard guard: if required inputs missing, bounce to create-lesson
  useEffect(() => {
    if (!reqPrompt || !grade || !slides || !slidesData || slidesData.length === 0) {
      dispatch(setAvailability(false));
      router.replace("/create-lesson");
    } else {
      dispatch(setAvailability(true));
    }
  }, [reqPrompt, grade, slides, slidesData, dispatch, router]);

  useEffect(() => {
    setTitles(getTitles(slidesRes || []));
    setNotes(getNotes(slidesRes || []));
    setSelected(0);
  }, [slidesRes]);

  useEffect(() => {
    if (tileRefs.current[selected]) {
      tileRefs.current[selected].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [selected]);

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    const handleScroll = (event) => {
      if (event.type === "wheel") {
        if (event.deltaY < 0)
          setSelected((prev) => clamp(prev - 1, 0, totalSlides - 1));
        else if (event.deltaY > 0)
          setSelected((prev) => clamp(prev + 1, 0, totalSlides - 1));
      } else if (event.type === "keydown") {
        if (event.key === "ArrowUp")
          setSelected((prev) => clamp(prev - 1, 0, totalSlides - 1));
        else if (event.key === "ArrowDown")
          setSelected((prev) => clamp(prev + 1, 0, totalSlides - 1));
      }
    };
    el.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("keydown", handleScroll);
    return () => {
      el.removeEventListener("wheel", handleScroll);
      window.removeEventListener("keydown", handleScroll);
    };
  }, [totalSlides]);

  // Helper: clear persisted artifacts from previous run
  function clearPrevRunArtifacts() {
    try {
      localStorage.removeItem("url");              // Google Slides link from old run
      localStorage.removeItem("artifactSocketID"); // pinned id for PPTX downloads
      localStorage.removeItem("socketID");         // live id snapshot
    } catch {}
  }

  // Reset session (cancel in-flight, clear artifacts, disconnect socket) and go to create-lesson
  function resetSessionAndGoBack() {
    if (backHandledRef.current) return; // guard against re-entrancy
    backHandledRef.current = true;

    // 1) mark as canceled so no toasts/UI updates fire when responses arrive
    canceledRef.current = true;

    // 2) abort any in-flight requests from updateAndUpload()
    try {
      abortersRef.current.forEach((c) => c?.abort?.());
      abortersRef.current = [];
    } catch {}

    // 3) clear artifacts so Slides button can’t open old deck
    clearPrevRunArtifacts();

    // 4) disconnect socket so a NEW socket id will be created next time
    try {
      disconnectSocket(dispatch);
    } catch {}

    // OPTIONAL: clear redux slices if you want a fully clean store
    // dispatch(setSocketId(""));
    // dispatch(setReceivedData([]));
    // dispatch(setImageData([]));

    // 5) leave the page — go to create-lesson (fresh flow)
    router.replace("/create-lesson");
  }

  // Intercept BROWSER BACK to behave like our Back button
  useEffect(() => {
    // Push a guard state so the next "Back" triggers a popstate we control
    try {
      window.history.pushState({ guard: "slides-preview" }, "", window.location.href);
    } catch {}

    const onPopState = () => {
      // Ensure single handling
      if (backHandledRef.current) return;
      resetSessionAndGoBack();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Kick off update+upload once per mount when we have a socketId and slidesData
  useEffect(() => {
    const canRun =
      !!socketId &&
      Array.isArray(slidesData) &&
      slidesData.length > 0 &&
      !sentRef.current;
    if (!canRun) return;

    sentRef.current = true;
    canceledRef.current = false; // this mount/run is now active
    clearPrevRunArtifacts();     // make sure old links/ids cannot be used in this new run

    dispatch(setLoading(true));

    const updateAndUpload = async () => {
      // each fetch uses its own AbortController; we keep references to cancel on "Back"
      const updCtrl = new AbortController();
      abortersRef.current.push(updCtrl);

      try {
        const upd = await fetch(
          `/api/lesson-builder/slides/update?socketID=${encodeURIComponent(socketId)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              text: `<START>${JSON.stringify(slidesData)}<END>`,
            }),
            cache: "no-store",
            redirect: "follow",
            signal: updCtrl.signal,
          }
        );

        // If user hit Back meanwhile, stop here quietly
        if (canceledRef.current) return;

        const upCtrl = new AbortController();
        abortersRef.current.push(upCtrl);

        const uploadRes = await fetch(
          `/api/lesson-builder/slides/upload?socketID=${encodeURIComponent(socketId)}`,
          { method: "POST", cache: "no-store", redirect: "follow", signal: upCtrl.signal }
        );

        if (canceledRef.current) return;

        const uploadText = await uploadRes.text().catch(() => "fail");
        if (uploadRes.ok && uploadText && uploadText !== "fail") {
          // Store ONLY if this run wasn't canceled
          try { localStorage.setItem("url", uploadText); } catch {}
        } else {
          console.warn("Upload failed:", uploadRes.status, uploadText);
        }

        dispatch(setLoading(false));

        if (canceledRef.current) return;

        if (upd.ok) {
          toast.success("Slides Created Successfully");
        } else {
          const msg = await (async () => {
            const ct = upd.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
              try {
                const j = await upd.json();
                return `${upd.status} ${upd.statusText} ${j?.error ?? ""} ${j?.details ?? ""}`;
              } catch {
                return `${upd.status} ${upd.statusText}`;
              }
            } else {
              try {
                const t = await upd.text();
                return `${upd.status} ${upd.statusText} ${t}`;
              } catch {
                return `${upd.status} ${upd.statusText}`;
              }
            }
          })();
          toast.error(`Error updating slides: ${msg}`);
        }
      } catch (error) {
        if (canceledRef.current) {
          // aborted by Back — do nothing
          return;
        }
        dispatch(setLoading(false));
        console.error("Error updating/uploading slides:", error);
        toast.error(`Error updating slides, ${String(error)}`);
      } finally {
        // clean out finished controllers
        abortersRef.current = abortersRef.current.filter((c) => !c.signal.aborted);
      }
    };

    updateAndUpload();

    // On unmount, auto-cancel in-flight work to avoid ghost toasts
    return () => {
      canceledRef.current = true;
      try {
        abortersRef.current.forEach((c) => c?.abort?.());
        abortersRef.current = [];
      } catch {}
    };
  }, [socketId, slidesData, dispatch, setFinalModal]);

  const enterFullscreenAndLockOrientation = async () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches
    ) {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          if (
            screen.orientation &&
            typeof screen.orientation.lock === "function"
          ) {
            await screen.orientation.lock("landscape-primary");
          }
        }
      } catch (error) {
        console.error("Failed to enter fullscreen or lock orientation:", error);
      }
    }
  };
  useEffect(() => {
    enterFullscreenAndLockOrientation();
  }, []);

  const selectedTile = slidesRes?.[selected - 2];
  const selectedTileImage = slidesResImages?.[selected - 2];

  return (
    <div className="min-h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-20 w-full flex-shrink-0">
        <Header />
      </div>

      {/* Middle */}
      <main className="flex-1 flex flex-col items-center px-4 py-6 overflow-hidden">
        <div className="w-full max-w-7xl">
          <div className="w-full bg-white rounded-xl relative overflow-hidden flex">
            {/* Button group top-right */}
            <div className="absolute top-3 right-4 sm:top-4 sm:right-6 flex items-center gap-3 z-30">
              <button
                onClick={resetSessionAndGoBack}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-green-500 bg-white text-green-600 hover:bg-green-50 transition-colors"
                title="Back to create lesson page"
              >
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 14.707a1 1 0 01-1.414 0L6.586 10l4.707-4.707a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="font-semibold text-sm sm:text-base">Back</span>
              </button>
              <DownloadMenu />
            </div>

            {/* Sidebar */}
            <div className="w-1/4 min-w-[200px] max-w-xs h-[calc(100vh-10rem)] overflow-y-auto p-4 space-y-4 bg-[#f5edfa] border-r-4 border-[#7d00a8] z-10 scrollable">
              <SmallTitle
                setSelected={() => setSelected(0)}
                selected={selected === 0}
                ref={(el) => (tileRefs.current[0] = el)}
              />
              <SmallTable
                data={titles}
                setSelected={() => setSelected(1)}
                selected={selected === 1}
                ref={(el) => (tileRefs.current[1] = el)}
              />
              {slidesRes?.map((tile, index) => (
                <SmallTile
                  key={index + 2}
                  image={slidesResImages?.[index] || {}}
                  data={tile}
                  setSelected={() => setSelected(index + 2)}
                  selected={selected === index + 2}
                  ref={(el) => (tileRefs.current[index + 2] = el)}
                />
              ))}
            </div>

            {/* Preview */}
            <div
              ref={slideRef}
              className="flex-1 flex flex-col justify-center items-center p-4 overflow-hidden relative"
              id="slideRef"
            >
              <div className="w-full flex justify-center items-center">
                <div className="w-full max-w-3xl flex justify-center items-center">
                  <div className="w-full aspect-[16/9] border-2 border-[#7d00a8] rounded-xl bg-white overflow-hidden">
                    {selected === 0 ? (
                      <LargeTitle />
                    ) : selected === 1 ? (
                      <LargeTable data={titles} />
                    ) : (
                      <LargeTile
                        data={selectedTile || { title: "", content: [] }}
                        image={selectedTileImage || {}}
                      />
                    )}
                  </div>
                </div>
              </div>

              {selected > 1 && (
                <div className="mt-6 w-full max-w-3xl relative z-10">
                  <Bar
                    loading={loading}
                    setFinalModal={setFinalModal}
                    data={notes?.[selected - 2]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="h-20 w-full flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
}










































// "use client";

// import React, { useEffect, useState, useRef, useMemo } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import LargeTile from "./Components/LargeTile.jsx";
// import SmallTile from "./Components/SmallTile.jsx";
// import SmallTable from "./Components/SmallTable.jsx";
// import LargeTable from "./Components/LargeTable.jsx";
// import Bar from "./Components/Bar.jsx";
// import SmallTitle from "./Components/SmallTitle.jsx";
// import LargeTitle from "./Components/LargeTitle.jsx";
// import DownloadMenu from "./Components/DownloadMenu.jsx";
// import { toast } from "react-toastify";
// import { useRouter } from "next/navigation";
// import Header from "@/components/Header.jsx";
// import Footer from "@/components/Footer.jsx";
// import { setAvailability, setLoading } from "../../Redux/slices/DownloadSlice.js";

// /**
//  * SlidesPreview
//  *
//  * The main preview page for generated slides. This component is responsible
//  * for displaying thumbnails on the left, the currently selected slide in the
//  * centre and optional notes at the bottom. It also exposes a back button and
//  * a download menu at the top of the card. The layout matches the provided
//  * screenshots: the page is full height, has a gradient background, and
//  * spacing above/below the main card. Only the thumbnail list and notes area
//  * scroll, preventing the overall window from scrolling. The component
//  * remains responsive across mobile up to extra‑large screens.
//  */
// export default function SlidesPreview({ setFinalModal }) {
//   // Retrieve relevant state from Redux. We fall back gracefully if
//   // undefined values are encountered.
//   const slidesData = useSelector((state) => state.outline.outline);
//   const socketId = useSelector((state) => state.socket.socketId);
//   const slidesRes = useSelector((state) => state.socket.receivedData);
//   const slidesResImages = useSelector((state) => state.socket.imageData);
//   const { reqPrompt, grade, slides } = useSelector((state) => state.promptData);
//   const { loading } = useSelector((state) => state.download);

//   // Local UI state
//   const [selected, setSelected] = useState(0);
//   const [titles, setTitles] = useState([]);
//   const [notes, setNotes] = useState([]);

//   const tileRefs = useRef([]);
//   const sentRef = useRef(false);
//   const slideRef = useRef(null);
//   const dispatch = useDispatch();
//   const router = useRouter();

//   // Helpers to extract titles and notes from the server response
//   const getTitles = (data) =>
//     Array.isArray(data) ? data.map((d) => d?.title ?? "") : [];
//   const getNotes = (data) =>
//     Array.isArray(data) ? data.map((d) => d?.notes ?? "") : [];

//   // Compute total slides: 2 static (title and table) plus dynamic tiles
//   const totalSlides = useMemo(() => (slidesRes?.length ?? 0) + 2, [slidesRes]);

//   const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
//   const onSliderChange = (val) =>
//     setSelected(clamp(parseInt(val, 10), 0, Math.max(totalSlides - 1, 0)));

//   // Guard route if prerequisites are missing
//   useEffect(() => {
//     if (!reqPrompt || !grade || !slides || !slidesData || slidesData.length === 0) {
//       dispatch(setAvailability(false));
//       router.replace("/create-lesson");
//     } else {
//       dispatch(setAvailability(true));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reqPrompt, grade, slides, slidesData]);

//   // Update titles and notes when slide data arrives
//   useEffect(() => {
//     setTitles(getTitles(slidesRes || []));
//     setNotes(getNotes(slidesRes || []));
//     setSelected(0);
//   }, [slidesRes]);

//   // Scroll thumbnail list to keep the selected item in view
//   useEffect(() => {
//     if (tileRefs.current[selected]) {
//       tileRefs.current[selected].scrollIntoView({
//         behavior: "smooth",
//         block: "nearest",
//         inline: "start",
//       });
//     }
//   }, [selected]);

//   // Wheel & keyboard navigation for slide selection
//   useEffect(() => {
//     const el = slideRef.current;
//     if (!el) return;
//     const handleScroll = (event) => {
//       if (event.type === "wheel") {
//         if (event.deltaY < 0)
//           setSelected((prev) => clamp(prev - 1, 0, totalSlides - 1));
//         else if (event.deltaY > 0)
//           setSelected((prev) => clamp(prev + 1, 0, totalSlides - 1));
//       } else if (event.type === "keydown") {
//         if (event.key === "ArrowUp")
//           setSelected((prev) => clamp(prev - 1, 0, totalSlides - 1));
//         else if (event.key === "ArrowDown")
//           setSelected((prev) => clamp(prev + 1, 0, totalSlides - 1));
//       }
//     };
//     el.addEventListener("wheel", handleScroll, { passive: true });
//     window.addEventListener("keydown", handleScroll);
//     return () => {
//       el.removeEventListener("wheel", handleScroll);
//       window.removeEventListener("keydown", handleScroll);
//     };
//   }, [totalSlides]);

//   // Update and upload slides to the backend when the page loads. The
//   // implementation is unchanged from the original; the only difference is
//   // presenting the download menu immediately rather than waiting for a modal.
//   useEffect(() => {
//     const canRun =
//       !!socketId &&
//       Array.isArray(slidesData) &&
//       slidesData.length > 0 &&
//       !sentRef.current;
//     if (!canRun) return;
//     sentRef.current = true;
//     dispatch(setLoading(true));
//     const updateAndUpload = async () => {
//       try {
//         const upd = await fetch(
//           `/api/lesson-builder/slides/update?socketID=${encodeURIComponent(socketId)}`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Accept: "application/json",
//             },
//             body: JSON.stringify({
//               text: `<START>${JSON.stringify(slidesData)}<END>`,
//             }),
//             cache: "no-store",
//             redirect: "follow",
//           }
//         );
//         const uploadRes = await fetch(
//           `/api/lesson-builder/slides/upload?socketID=${encodeURIComponent(socketId)}`,
//           { method: "POST", cache: "no-store", redirect: "follow" }
//         );
//         const uploadText = await uploadRes.text().catch(() => "fail");
//         if (uploadRes.ok && uploadText && uploadText !== "fail") {
//           localStorage.setItem("url", uploadText);
//         } else {
//           console.warn("Upload failed:", uploadRes.status, uploadText);
//         }
//         dispatch(setLoading(false));
//         if (upd.ok) {
//           // On success we still toast but no longer trigger a modal. The download button
//           // remains visible at all times so the user can immediately download or open
//           // the file once it is ready.
//           toast.success("Slides Created Successfully");
//         } else {
//           const msg = await (async () => {
//             const ct = upd.headers.get("content-type") || "";
//             if (ct.includes("application/json")) {
//               try {
//                 const j = await upd.json();
//                 return `${upd.status} ${upd.statusText} ${j?.error ?? ""} ${j?.details ?? ""}`;
//               } catch {
//                 return `${upd.status} ${upd.statusText}`;
//               }
//             } else {
//               try {
//                 const t = await upd.text();
//                 return `${upd.status} ${upd.statusText} ${t}`;
//               } catch {
//                 return `${upd.status} ${upd.statusText}`;
//               }
//             }
//           })();
//           toast.error(`Error updating slides: ${msg}`);
//         }
//       } catch (error) {
//         dispatch(setLoading(false));
//         console.error("Error updating/uploading slides:", error);
//         toast.error(`Error updating slides, ${String(error)}`);
//       }
//     };
//     updateAndUpload();
//   }, [socketId, slidesData, dispatch, setFinalModal]);

//   // Enter fullscreen and lock orientation on mobile devices. Unchanged.
//   const enterFullscreenAndLockOrientation = async () => {
//     if (
//       typeof window !== "undefined" &&
//       window.matchMedia("(max-width: 639px)").matches
//     ) {
//       try {
//         const elem = document.documentElement;
//         if (elem.requestFullscreen) {
//           await elem.requestFullscreen();
//           if (
//             screen.orientation &&
//             typeof screen.orientation.lock === "function"
//           ) {
//             await screen.orientation.lock("landscape-primary");
//           }
//         }
//       } catch (error) {
//         console.error("Failed to enter fullscreen or lock orientation:", error);
//       }
//     }
//   };
//   useEffect(() => {
//     enterFullscreenAndLockOrientation();
//   }, []);

//   const selectedTile = slidesRes?.[selected - 2];
//   const selectedTileImage = slidesResImages?.[selected - 2];

//   return (
//     <div className="min-h-screen w-full flex flex-col overflow-hidden bg-gradient-to-r from-[#500078] to-[#9500DE]">
//       <Header />
//       {/* Middle section with spacing top/bottom. It never allows the window to scroll; instead, the thumbnail list and notes area scroll internally. */}
//       <main className="flex-1 flex justify-center items-center px-4 mt-20 mb-20 overflow-hidden">
//         {/* Outer preview container. Use a light background and soft border to match the design. */}
//         <div className="w-full max-w-7xl bg-white rounded-3xl border border-gray-300 relative overflow-hidden flex">
//           {/* Back button – returns the user to the outline page. Styled as a pill with a green border and icon. */}
//           <button
//             onClick={() => router.push("/create-lesson/outline")}
//             className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-4 py-2 rounded-full border-2 border-green-500 bg-white text-green-600 hover:bg-green-50 transition-colors z-30"
//             title="Back to outline"
//           >
//             {/* Circle containing the left arrow */}
//             <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white">
//               <svg
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//                 className="w-3 h-3 sm:w-4 sm:h-4"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M12.707 14.707a1 1 0 01-1.414 0L6.586 10l4.707-4.707a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </span>
//             <span className="font-semibold text-sm sm:text-base">Back</span>
//           </button>
//           {/* Download menu – toggles on click and exposes PPTX/Slides actions. */}
//           <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
//             <DownloadMenu />
//           </div>
//           {/* Left sidebar with thumbnails. The right border is a thick purple line and the background is a pale lavender. */}
//           <div className="w-1/4 min-w-[200px] max-w-xs h-full overflow-y-auto p-4 space-y-4 bg-[#f5edfa] border-r-4 border-[#7d00a8] z-10 scrollable">
//             <SmallTitle
//               setSelected={() => setSelected(0)}
//               selected={selected === 0}
//               ref={(el) => (tileRefs.current[0] = el)}
//             />
//             <SmallTable
//               data={titles}
//               setSelected={() => setSelected(1)}
//               selected={selected === 1}
//               ref={(el) => (tileRefs.current[1] = el)}
//             />
//             {slidesRes?.map((tile, index) => (
//               <SmallTile
//                 key={index + 2}
//                 image={slidesResImages?.[index] || {}}
//                 data={tile}
//                 setSelected={() => setSelected(index + 2)}
//                 selected={selected === index + 2}
//                 ref={(el) => (tileRefs.current[index + 2] = el)}
//               />
//             ))}
//           </div>
//           {/* Main preview area. Contains the selected slide and optional notes. */}
//           <div
//             ref={slideRef}
//             className="flex-1 flex flex-col justify-center items-center p-4 overflow-hidden relative"
//             id="slideRef"
//           >
//             <div className="w-full flex justify-center items-center">
//               {/* Outer wrapper enforcing the 16/9 aspect ratio and purple border around the slide */}
//               <div className="w-full max-w-3xl flex justify-center items-center">
//                 <div className="w-full aspect-[16/9] border-2 border-[#7d00a8] rounded-xl bg-white overflow-hidden">
//                   {/* Inner slide content. We remove extra card chrome so the border belongs to the wrapper. */}
//                   {selected === 0 ? (
//                     <LargeTitle />
//                   ) : selected === 1 ? (
//                     <LargeTable data={titles} />
//                   ) : (
//                     <LargeTile
//                       data={selectedTile || { title: "", content: [] }}
//                       image={selectedTileImage || {}}
//                     />
//                   )}
//                 </div>
//               </div>
//             </div>
//             {/* Notes bar appears only for content slides */}
//             {selected > 1 && (
//               <div className="mt-6 w-full max-w-3xl relative z-10">
//                 <Bar
//                   loading={loading}
//                   setFinalModal={setFinalModal}
//                   data={notes?.[selected - 2]}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }










































// // app/(wherever)/SlidesPreview/index.jsx
// "use client";

// import React, { useEffect, useState, useRef, useMemo } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import LargeTile from "./Components/LargeTile.jsx";
// import SmallTile from "./Components/SmallTile.jsx";
// import SmallTable from "./Components/SmallTable.jsx";
// import LargeTable from "./Components/LargeTable.jsx";
// import Bar from "./Components/Bar.jsx";
// import SmallTitle from "./Components/SmallTitle.jsx";
// import LargeTitle from "./Components/LargeTitle.jsx";
// import { toast } from "react-toastify";
// import { useRouter } from "next/navigation";
// import Header from "@/components/Header.jsx";
// import Footer from "@/components/Footer.jsx";
// import { setAvailability, setLoading } from "../../Redux/slices/DownloadSlice.js";

// export default function SlidesPreview({ setFinalModal }) {
//   const slidesData = useSelector((state) => state.outline.outline);
//   const socketId = useSelector((state) => state.socket.socketId);
//   const slidesRes = useSelector((state) => state.socket.receivedData);
//   const slidesResImages = useSelector((state) => state.socket.imageData);
//   const { reqPrompt, grade, slides } = useSelector((state) => state.promptData);
//   const { loading } = useSelector((state) => state.download);

//   const [selected, setSelected] = useState(0);
//   const [titles, setTitles] = useState([]);
//   const [notes, setNotes] = useState([]);

//   const tileRefs = useRef([]);
//   const sentRef = useRef(false);
//   const slideRef = useRef(null); // <— use ref instead of querySelector
//   const dispatch = useDispatch();
//   const router = useRouter();

//   const getTitles = (data) =>
//     Array.isArray(data) ? data.map((d) => d?.title ?? "") : [];
//   const getNotes = (data) =>
//     Array.isArray(data) ? data.map((d) => d?.notes ?? "") : [];

//   // total slides = 2 (title + table) + dynamic tiles
//   const totalSlides = useMemo(
//     () => (slidesRes?.length ?? 0) + 2,
//     [slidesRes]
//   );

//   const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
//   const onSliderChange = (val) =>
//     setSelected(clamp(parseInt(val, 10), 0, Math.max(totalSlides - 1, 0)));

//   // Guard route
//   useEffect(() => {
//     if (!reqPrompt || !grade || !slides || !slidesData || slidesData.length === 0) {
//       dispatch(setAvailability(false));
//       router.replace("/create-lesson");
//     } else {
//       dispatch(setAvailability(true));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reqPrompt, grade, slides, slidesData]);

//   useEffect(() => {
//     setTitles(getTitles(slidesRes || []));
//     setNotes(getNotes(slidesRes || []));
//     setSelected(0);
//   }, [slidesRes]);

//   // Scroll side panel to selection
//   useEffect(() => {
//     if (tileRefs.current[selected]) {
//       tileRefs.current[selected].scrollIntoView({
//         behavior: "smooth",
//         block: "nearest",
//         inline: "start",
//       });
//     }
//   }, [selected]);

//   // Wheel & keyboard navigation (bound by totalSlides)
//   useEffect(() => {
//     const el = slideRef.current;
//     if (!el) return;

//     const handleScroll = (event) => {
//       if (event.type === "wheel") {
//         if (event.deltaY < 0)
//           setSelected((prev) => clamp(prev - 1, 0, totalSlides - 1));
//         else if (event.deltaY > 0)
//           setSelected((prev) => clamp(prev + 1, 0, totalSlides - 1));
//       } else if (event.type === "keydown") {
//         if (event.key === "ArrowUp")
//           setSelected((prev) => clamp(prev - 1, 0, totalSlides - 1));
//         else if (event.key === "ArrowDown")
//           setSelected((prev) => clamp(prev + 1, 0, totalSlides - 1));
//       }
//     };

//     // passive wheel for better perf
//     el.addEventListener("wheel", handleScroll, { passive: true });
//     window.addEventListener("keydown", handleScroll);

//     return () => {
//       el.removeEventListener("wheel", handleScroll);
//       window.removeEventListener("keydown", handleScroll);
//     };
//   }, [totalSlides]);

//   // Update + upload slides
//   useEffect(() => {
//     const canRun =
//       !!socketId &&
//       Array.isArray(slidesData) &&
//       slidesData.length > 0 &&
//       !sentRef.current;

//     if (!canRun) return;

//     sentRef.current = true;
//     dispatch(setLoading(true));

//     const updateAndUpload = async () => {
//       try {
//         const upd = await fetch(
//           `/api/lesson-builder/slides/update?socketID=${encodeURIComponent(
//             socketId
//           )}`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Accept: "application/json",
//             },
//             body: JSON.stringify({
//               text: `<START>${JSON.stringify(slidesData)}<END>`,
//             }),
//             cache: "no-store",
//             redirect: "follow",
//           }
//         );

//         const uploadRes = await fetch(
//           `/api/lesson-builder/slides/upload?socketID=${encodeURIComponent(
//             socketId
//           )}`,
//           { method: "POST", cache: "no-store", redirect: "follow" }
//         );

//         const uploadText = await uploadRes.text().catch(() => "fail");
//         if (uploadRes.ok && uploadText && uploadText !== "fail") {
//           localStorage.setItem("url", uploadText);
//         } else {
//           console.warn("Upload failed:", uploadRes.status, uploadText);
//         }

//         dispatch(setLoading(false));

//         if (upd.ok) {
//           toast.success("Slides Created Successfully");
//           if (typeof setFinalModal === "function") setFinalModal(true);
//         } else {
//           const msg = await (async () => {
//             const ct = upd.headers.get("content-type") || "";
//             if (ct.includes("application/json")) {
//               try {
//                 const j = await upd.json();
//                 return `${upd.status} ${upd.statusText} ${j?.error ?? ""} ${
//                   j?.details ?? ""
//                 }`;
//               } catch {
//                 return `${upd.status} ${upd.statusText}`;
//               }
//             } else {
//               try {
//                 const t = await upd.text();
//                 return `${upd.status} ${upd.statusText} ${t}`;
//               } catch {
//                 return `${upd.status} ${upd.statusText}`;
//               }
//             }
//           })();
//           toast.error(`Error updating slides: ${msg}`);
//         }
//       } catch (error) {
//         dispatch(setLoading(false));
//         console.error("Error updating/uploading slides:", error);
//         toast.error(`Error updating slides, ${String(error)}`);
//       }
//     };

//     updateAndUpload();
//   }, [socketId, slidesData, dispatch, setFinalModal]);

//   // Fullscreen on mobile
//   const enterFullscreenAndLockOrientation = async () => {
//     if (
//       typeof window !== "undefined" &&
//       window.matchMedia("(max-width: 639px)").matches
//     ) {
//       try {
//         const elem = document.documentElement;
//         if (elem.requestFullscreen) {
//           await elem.requestFullscreen();
//           if (
//             screen.orientation &&
//             typeof screen.orientation.lock === "function"
//           ) {
//             await screen.orientation.lock("landscape-primary");
//           }
//         }
//       } catch (error) {
//         console.error("Failed to enter fullscreen or lock orientation:", error);
//       }
//     }
//   };
//   useEffect(() => {
//     enterFullscreenAndLockOrientation();
//   }, []);

//   const selectedTile = slidesRes?.[selected - 2];
//   const selectedTileImage = slidesResImages?.[selected - 2];

//   return (
//     <div
   
//       className="flex flex-col h-screen overflow-hidden bg-gradient-to-r from-[#500078] to-[#9500DE]"
//     >
//       <Header />

//       <main className="flex-1 flex justify-center items-center px-4 overflow-hidden">
//         <div className="w-full max-w-7xl bg-gray-200 rounded-3xl shadow-xl relative overflow-hidden flex">
//           {/* Back to builder */}
//           <button
//             onClick={() => router.push("/create-lesson")}
//             className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors z-30"
//             title="Back to builder"
//           >
//             <svg
//               fill="currentColor"
//               className="w-5 h-5 sm:w-6 sm:h-6"
//               viewBox="0 0 489.533 489.533"
//               aria-hidden
//             >
//               <path d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9 l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6 c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6 C49.575,418.961,150.875,501.261,268.175,488.161z" />
//             </svg>
//           </button>

//           {/* Left sidebar (thumbnails) */}
//           <div className="w-1/4 min-w-[220px] max-w-xs h-full overflow-y-auto p-4 space-y-4 bg-gray-100 z-10 scrollable">
//             <SmallTitle
//               data={titles}
//               setSelected={() => setSelected(0)}
//               selected={selected === 0}
//               ref={(el) => (tileRefs.current[0] = el)}
//             />
//             <SmallTable
//               data={titles}
//               setSelected={() => setSelected(1)}
//               selected={selected === 1}
//               ref={(el) => (tileRefs.current[1] = el)}
//             />
//             {slidesRes?.map((tile, index) => (
//               <SmallTile
//                 key={index + 2}
//                 image={slidesResImages?.[index] || {}}
//                 data={tile}
//                 setSelected={() => setSelected(index + 2)}
//                 selected={selected === index + 2}
//                 ref={(el) => (tileRefs.current[index + 2] = el)}
//               />
//             ))}
//           </div>

//           {/* Main preview area */}
//           <div
//             ref={slideRef}
//             className="flex-1 flex flex-col justify-center items-center p-4 overflow-hidden relative"
//             id="slideRef"
//           >
//             <div className="w-full flex justify-center items-center">
//               {/* Single card */}
//               <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 flex justify-center items-center min-h-[250px] relative z-10">
//                 {selected === 0 ? (
//                   <LargeTitle />
//                 ) : selected === 1 ? (
//                   <LargeTable data={titles} />
//                 ) : (
//                   <LargeTile
//                     data={selectedTile || { title: "", content: [] }}
//                     image={selectedTileImage || {}}
//                   />
//                 )}
//               </div>
//             </div>

//             {selected > 1 && (
//               <div className="mt-6 w-full max-w-3xl relative z-10">
//                 <Bar
//                   loading={loading}
//                   setFinalModal={setFinalModal}
//                   data={notes?.[selected - 2]}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       <Footer />

      
//     </div>
//   );
// }
