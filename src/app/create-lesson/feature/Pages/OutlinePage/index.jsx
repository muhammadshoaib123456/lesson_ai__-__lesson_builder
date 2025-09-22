"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FetchOutline from "../../GlobalFuncs/FetchOutline.js";
import uuid from "react-uuid";
import { useRouter } from "next/navigation";
import ButtonGroup from "./Components/ButtonGroup.jsx";
import TopText from "./Components/TopText.jsx";
import SlideComponent from "./Components/SlideComponent.jsx";
import { setOutline } from "../../Redux/slices/OutlineSlice.js";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import {
  setDefaultImageData,
  setDefaultReceivedData,
} from "../../Redux/slices/SocketSlice.js";

export default function OutlinePage({ setLoading, setFinalModal, setQueueStatus }) {
  const [dataJSON, setDataJSON] = useState([]);
  const runningRef = useRef(false); // prevent overlapping fetches

  const { socketId } = useSelector((state) => state.socket);
  const { reqPrompt, grade, slides, subject } = useSelector(
    (state) => state.promptData
  );

  const dispatch = useDispatch();
  const router = useRouter();

  // ---- helpers ----
  function genSlides(e) {
    e.preventDefault();
    dispatch(setOutline(dataJSON));
    dispatch(
      setDefaultReceivedData(
        Array.from({ length: dataJSON.length }, (_, i) => ({
          title: "",
          content: [""],
          slide: i + 1,
        }))
      )
    );
    dispatch(
      setDefaultImageData(
        Array.from({ length: dataJSON.length }, (_, i) => ({
          slide_number: i + 1,
          image_data: "",
        }))
      )
    );
    router.push("/create-lesson/preview");
  }

  function DeleteSlide(index) {
    setDataJSON((prev) => {
      const next = prev.map((s) => ({ ...s }));
      for (let i = index; i < next.length; i++) {
        next[i].slide_number -= 1;
      }
      return next.slice(0, index - 1).concat(next.slice(index));
    });
  }

  function AddSlideAbove(index) {
    setDataJSON((prev) => {
      const base = prev.map((s) => ({ ...s, content: [...s.content] }));
      const newSlide = {
        title: "",
        content: [""],
        slide_number: base[index - 1].slide_number,
      };
      return [
        ...base.slice(0, index - 1),
        newSlide,
        ...base.slice(index - 1).map((s) => ({
          ...s,
          slide_number: s.slide_number + 1,
        })),
      ];
    });
  }

  function AddSlideBelow(index) {
    setDataJSON((prev) => {
      const base = prev.map((s) => ({ ...s, content: [...s.content] }));
      const newSlide = {
        title: "",
        content: [""],
        slide_number: base[index - 1].slide_number + 1,
      };
      return [
        ...base.slice(0, index),
        newSlide,
        ...base.slice(index).map((s) => ({
          ...s,
          slide_number: s.slide_number + 1,
        })),
      ];
    });
  }

  // Centralized fetch runner so we can choose quiet/noisy behavior
  const runFetch = async (quiet) => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      const result = await FetchOutline(
        socketId,
        reqPrompt,
        grade,
        slides,
        setLoading,
        setQueueStatus,
        dispatch,
        subject,
        { quiet }
      );

      if (!result?.ok) {
        // Missing fields or early refresh → silently go back to the form
        if (result?.error === "MISSING_FIELDS") {
          router.replace("/create-lesson");
          return;
        }
        // Other errors:
        // - quiet=false: FetchOutline already showed a toast and we can decide routing UX.
        // - quiet=true: no toast; we route them back.
        router.replace("/create-lesson");
        return;
      }

      // Success
      const outline = Array.isArray(result.outline) ? result.outline : [];
      setDataJSON(outline);
    } finally {
      runningRef.current = false;
    }
  };

  // Clear any "final" modal on entry
  useEffect(() => {
    setFinalModal?.(false);
  }, [setFinalModal]);

  // If critical fields are missing, just route back (no popup)
  useEffect(() => {
    if (!socketId || !reqPrompt || (!grade && grade !== 0) || !slides || !subject) {
      router.replace("/create-lesson");
    }
  }, [socketId, reqPrompt, grade, slides, subject, router]);

  // Initial load: quiet fetch (no toasts on precondition errors)
  useEffect(() => {
    runFetch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate handler: user-initiated → noisy (toasts allowed)
  const onRegenerate = async (e) => {
    e?.preventDefault?.();
    await runFetch(false);
  };

  return (
    <div
      id="outline-no-footer-border"
      className="flex flex-col h-screen overflow-hidden bg-gradient-to-r from-[#500078] to-[#9500DE]"
    >
      <Header />

      <main className="flex-1 flex justify-center items-center px-4 overflow-hidden">
        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl z-10 flex flex-col relative p-6 sm:p-8">
          {/* Regenerate button */}
          <button
            type="button"
            onClick={onRegenerate}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-green-500 hover:bg-green-600 text-white transition-colors"
            title="Regenerate outline"
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

          <div className="mb-6">
            <TopText />
          </div>

          {/* Slide list (scrolls inside the card if needed) */}
          <div className="flex-1 overflow-y-auto max-h-[50vh] pr-2">
            <ul className="space-y-4 w-full">
              {dataJSON.map((item, index) => (
                <SlideComponent
                  setDataJson={setDataJSON}
                  points={item.content}
                  title={item.title}
                  index={index + 1}
                  DeleteSlide={DeleteSlide}
                  key={uuid()}
                  addSlideBelow={AddSlideBelow}
                  addSlideAbove={AddSlideAbove}
                />
              ))}
            </ul>
          </div>

          <div className="pt-6 flex justify-end">
            <ButtonGroup genSlides={genSlides} />
          </div>
        </div>
      </main>

      <Footer />

      {/* per-page footer override */}
      <style jsx global>{`
        #outline-no-footer-border footer {
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
          border: 0 !important;
        }
        #outline-no-footer-border footer .container {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
        }
        #outline-no-footer-border footer img {
          display: block;
        }
        #outline-no-footer-border footer .mt-10,
        #outline-no-footer-border footer .mb-8,
        #outline-no-footer-border footer .mt-18,
        #outline-no-footer-border footer .pr-20 {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          padding-right: 0 !important;
        }
      `}</style>
    </div>
  );
}
