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
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { setAvailability, setLoading } from "../../Redux/slices/DownloadSlice.js";

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
  const dispatch = useDispatch();
  const router = useRouter();

  const getTitles = (data) => (Array.isArray(data) ? data.map((d) => d?.title ?? "") : []);
  const getNotes = (data) => (Array.isArray(data) ? data.map((d) => d?.notes ?? "") : []);

  // total slides = 2 (title + table) + dynamic tiles
  const totalSlides = useMemo(() => (slidesRes?.length ?? 0) + 2, [slidesRes]);
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const onSliderChange = (val) => setSelected(clamp(parseInt(val, 10), 0, Math.max(totalSlides - 1, 0)));

  // Guard route
  useEffect(() => {
    if (!reqPrompt || !grade || !slides || !slidesData || slidesData.length === 0) {
      dispatch(setAvailability(false));
      router.replace("/create-lesson");
    } else {
      dispatch(setAvailability(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqPrompt, grade, slides, slidesData]);

  useEffect(() => {
    setTitles(getTitles(slidesRes || []));
    setNotes(getNotes(slidesRes || []));
    setSelected(0);
  }, [slidesRes]);

  // Scroll side panel to selection
  useEffect(() => {
    if (tileRefs.current[selected]) {
      tileRefs.current[selected].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [selected]);

  // Wheel & keyboard navigation (bound by totalSlides)
  useEffect(() => {
    const el = document.querySelector("#slideRef");
    if (!el) return;

    const handleScroll = (event) => {
      if (event.type === "wheel") {
        if (event.deltaY < 0) setSelected((prev) => clamp(prev - 1, 0, totalSlides - 1));
        else if (event.deltaY > 0) setSelected((prev) => clamp(prev + 1, 0, totalSlides - 1));
      } else if (event.type === "keydown") {
        if (event.key === "ArrowUp") setSelected((prev) => clamp(prev - 1, 0, totalSlides - 1));
        else if (event.key === "ArrowDown") setSelected((prev) => clamp(prev + 1, 0, totalSlides - 1));
      }
    };

    el.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("keydown", handleScroll);
    return () => {
      el.removeEventListener("wheel", handleScroll);
      window.removeEventListener("keydown", handleScroll);
    };
  }, [totalSlides]);

  // Update + upload slides
  useEffect(() => {
    const canRun =
      !!socketId &&
      Array.isArray(slidesData) &&
      slidesData.length > 0 &&
      !sentRef.current;

    if (!canRun) return;

    sentRef.current = true;
    dispatch(setLoading(true));

    const updateAndUpload = async () => {
      try {
        const upd = await fetch(
          `/api/lesson-builder/slides/update?socketID=${encodeURIComponent(socketId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              text: `<START>${JSON.stringify(slidesData)}<END>`,
            }),
            cache: "no-store",
            redirect: "follow",
          }
        );

        const uploadRes = await fetch(
          `/api/lesson-builder/slides/upload?socketID=${encodeURIComponent(socketId)}`,
          { method: "POST", cache: "no-store", redirect: "follow" }
        );
        const uploadText = await uploadRes.text().catch(() => "fail");
        if (uploadRes.ok && uploadText && uploadText !== "fail") {
          localStorage.setItem("url", uploadText);
        } else {
          console.warn("Upload failed:", uploadRes.status, uploadText);
        }

        dispatch(setLoading(false));

        if (upd.ok) {
          toast.success("Slides Created Successfully");
          if (typeof setFinalModal === "function") setFinalModal(true);
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
        dispatch(setLoading(false));
        console.error("Error updating/uploading slides:", error);
        toast.error(`Error updating slides, ${String(error)}`);
      }
    };

    updateAndUpload();
  }, [socketId, slidesData, dispatch, setFinalModal]);

  // Fullscreen on mobile
  const enterFullscreenAndLockOrientation = async () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches
    ) {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          if (screen.orientation && typeof screen.orientation.lock === "function") {
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
    <div
      id="slides-no-footer-border"
      className="flex flex-col h-screen overflow-hidden bg-gradient-to-r from-[#500078] to-[#9500DE]"
    >
      <Header />

      <main className="flex-1 flex justify-center items-center px-4 overflow-hidden">
        <div className="w-full max-w-7xl bg-gray-200 rounded-3xl shadow-xl relative overflow-hidden flex">
          {/* Back to builder */}
          <button
            onClick={() => router.push("/create-lesson")}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors z-30"
            title="Back to builder"
          >
            <svg
              fill="currentColor"
              className="w-5 h-5 sm:w-6 sm:h-6"
              viewBox="0 0 489.533 489.533"
              aria-hidden
            >
              <path d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9 l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6 c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6 C49.575,418.961,150.875,501.261,268.175,488.161z" />
            </svg>
          </button>

          {/* Left sidebar (thumbnails) */}
          <div className="w-1/4 min-w-[220px] max-w-xs h-full overflow-y-auto p-4 space-y-4 bg-gray-100 z-10">
            <SmallTitle
              data={titles}
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

          {/* LEFT-SIDE vertical slider (between sidebar and main preview) */}
          <div className="hidden sm:flex w-14 h-full items-center justify-center z-20">
            <div className="h-[72%] w-10 bg-gray-300/60 rounded-full flex flex-col items-center justify-between py-4">
              <input
                type="range"
                min={0}
                max={Math.max(totalSlides - 1, 0)}
                step={1}
                value={selected}
                onChange={(e) => onSliderChange(e.target.value)}
                aria-label="Slide selector"
                aria-orientation="vertical"
                className="range-vertical h-full w-8 cursor-pointer"
              />
              <span className="text-[10px] text-gray-700 bg-white/80 rounded px-1 py-0.5 shadow">
                {selected + 1}/{Math.max(totalSlides, 1)}
              </span>
            </div>
          </div>

          {/* Main preview area */}
          <div className="flex-1 flex flex-col justify-center items-center p-4 overflow-hidden relative" id="slideRef">
            <div className="w-full flex justify-center items-center">
              {/* Single card */}
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 flex justify-center items-center min-h-[250px] relative z-10">
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

            {selected > 1 && (
              <div className="mt-6 w-full max-w-3xl relative z-10">
                <Bar loading={loading} setFinalModal={setFinalModal} data={notes?.[selected - 2]} />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Per-page footer override + slider styles */}
      <style jsx global>{`
        #slides-no-footer-border footer {
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
          border: 0 !important;
        }
        #slides-no-footer-border footer .container {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
        }
        #slides-no-footer-border footer img {
          display: block;
        }
        #slides-no-footer-border footer .mt-10,
        #slides-no-footer-border footer .mb-8,
        #slides-no-footer-border footer .mt-18,
        #slides-no-footer-border footer .pr-20 {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          padding-right: 0 !important;
        }

        /* vertical range input (standards-based) */
        .range-vertical {
          writing-mode: vertical-lr; /* vertical orientation */
          direction: rtl;            /* low value at bottom, high at top */
          appearance: none;          /* enable custom styling */
          inline-size: 2rem;         /* visual width of control */
          block-size: 100%;          /* visual height of control */
        }

        /* thumb */
        .range-vertical::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: #2563eb; /* blue-600 */
          border: none;
        }
        .range-vertical::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 9999px;
          background: #2563eb;
        }

        /* track */
        .range-vertical::-webkit-slider-runnable-track {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 9999px;
        }
        .range-vertical::-moz-range-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
