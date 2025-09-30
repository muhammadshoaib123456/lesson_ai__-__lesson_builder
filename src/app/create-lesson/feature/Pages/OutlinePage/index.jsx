"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FetchOutline from "../../GlobalFuncs/FetchOutline.js";
import { useRouter } from "next/navigation";
import ButtonGroup from "./Components/ButtonGroup.jsx";
import TopText from "./Components/TopText.jsx";
import SlideComponent from "./Components/SlideComponent.jsx";
import { setOutline } from "../../Redux/slices/OutlineSlice.js";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { setDefaultImageData, setDefaultReceivedData } from "../../Redux/slices/SocketSlice.js";

export default function OutlinePage({ setLoading, setFinalModal, setQueueStatus }) {
  const [dataJSON, setDataJSON] = useState([]);
  const runningRef = useRef(false);
  const { socketId } = useSelector((state) => state.socket);
  const { reqPrompt, grade, slides, subject } = useSelector((state) => state.promptData);
  const dispatch = useDispatch();
  const router = useRouter();

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
      for (let i = index; i < next.length; i++) next[i].slide_number -= 1;
      return next.slice(0, index - 1).concat(next.slice(index));
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
        ...base.slice(index).map((s) => ({ ...s, slide_number: s.slide_number + 1 })),
      ];
    });
  }

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
        router.replace("/create-lesson");
        return;
      }
      const outline = Array.isArray(result.outline) ? result.outline : [];
      setDataJSON(outline);
    } finally {
      runningRef.current = false;
    }
  };

  // Pre-conditions: explain WHY if we bounce
  useEffect(() => {
    const missing = [];
    if (!socketId) missing.push("socketId");
    if (!reqPrompt) missing.push("reqPrompt");
    if (!slides) missing.push("slides");
    if (!subject) missing.push("subject");
    if (!grade && grade !== 0) missing.push("grade");

    if (missing.length) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[OUTLINE] missing preconditions:", missing);
      }
      router.replace("/create-lesson");
      return;
    }
  }, [socketId, reqPrompt, grade, slides, subject, router]);

  // ✅ Only fetch when socketId is ready (prevents the race)
  useEffect(() => {
    if (!socketId) return;
    if (process.env.NODE_ENV !== "production") {
      console.log("[OUTLINE] ready → FetchOutline with socketId:", socketId);
    }
    runFetch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketId]);

  const onRegenerate = async (e) => {
    e?.preventDefault?.();
    if (!socketId) return;
    await runFetch(false);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-6 mt-3 mb-3 overflow-hidden">
        <div className="w-full max-w-6xl">
          <div className="mt-0 w-full rounded-3xl bg-gradient-to-b from-purple-700 to-purple-300 p-6">
            <div className="text-center text-white">
              <h2 className="font-bold text-xl sm:text-2xl md:text-3xl">Outline Preview</h2>
              <TopText />
            </div>
            <div className="mt-6 bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 overflow-y-auto max-h-[45vh] md:max-h-[52vh] space-y-6 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
                <ul className="space-y-6">
                  {dataJSON.map((item) => (
                    <SlideComponent
                      setDataJson={setDataJSON}
                      points={item.content}
                      title={item.title}
                      index={item.slide_number}
                      DeleteSlide={DeleteSlide}
                      key={item.slide_number}
                      addSlideBelow={AddSlideBelow}
                    />
                  ))}
                </ul>
              </div>
              <div className="border-t border-gray-200 p-4 flex justify-end rounded-b-2xl">
                <ButtonGroup genSlides={genSlides} onRegenerate={onRegenerate} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


































// "use client";
// import { useEffect, useRef, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import FetchOutline from "../../GlobalFuncs/FetchOutline.js";
// import uuid from "react-uuid";
// import { useRouter } from "next/navigation";
// import ButtonGroup from "./Components/ButtonGroup.jsx";
// import TopText from "./Components/TopText.jsx";
// import SlideComponent from "./Components/SlideComponent.jsx";
// import { setOutline } from "../../Redux/slices/OutlineSlice.js";
// import Header from "@/components/Header.jsx";
// import Footer from "@/components/Footer.jsx";
// import { setDefaultImageData, setDefaultReceivedData } from "../../Redux/slices/SocketSlice.js";

// /**
//  * OutlinePage
//  *
//  * Shows the outline preview for the lesson. This version matches the UI
//  * in your screenshot: the outline is contained within a purple gradient
//  * card with its own header, a white card for the slides, and a bottom bar
//  * with action buttons. Only the slides card scrolls—there should be no
//  * global page scroll.
//  */
// export default function OutlinePage({ setLoading, setFinalModal, setQueueStatus }) {
//   const [dataJSON, setDataJSON] = useState([]);
//   const runningRef = useRef(false);
//   const { socketId } = useSelector((state) => state.socket);
//   const { reqPrompt, grade, slides, subject } = useSelector((state) => state.promptData);
//   const dispatch = useDispatch();
//   const router = useRouter();

//   // Generate full slides and move to preview page
//   function genSlides(e) {
//     e.preventDefault();
//     dispatch(setOutline(dataJSON));
//     dispatch(
//       setDefaultReceivedData(
//         Array.from({ length: dataJSON.length }, (_, i) => ({
//           title: "",
//           content: [""],
//           slide: i + 1,
//         }))
//       )
//     );
//     dispatch(
//       setDefaultImageData(
//         Array.from({ length: dataJSON.length }, (_, i) => ({
//           slide_number: i + 1,
//           image_data: "",
//         }))
//       )
//     );
//     router.push("/create-lesson/preview");
//   }

//   // Delete slide at index
//   function DeleteSlide(index) {
//     setDataJSON((prev) => {
//       const next = prev.map((s) => ({ ...s }));
//       for (let i = index; i < next.length; i++) {
//         next[i].slide_number -= 1;
//       }
//       return next.slice(0, index - 1).concat(next.slice(index));
//     });
//   }

//   // Add slide below index
//   function AddSlideBelow(index) {
//     setDataJSON((prev) => {
//       const base = prev.map((s) => ({ ...s, content: [...s.content] }));
//       const newSlide = {
//         title: "",
//         content: [""],
//         slide_number: base[index - 1].slide_number + 1,
//       };
//       return [
//         ...base.slice(0, index),
//         newSlide,
//         ...base.slice(index).map((s) => ({
//           ...s,
//           slide_number: s.slide_number + 1,
//         })),
//       ];
//     });
//   }

//   // Fetch outline from the server
//   const runFetch = async (quiet) => {
//     if (runningRef.current) return;
//     runningRef.current = true;
//     try {
//       const result = await FetchOutline(
//         socketId,
//         reqPrompt,
//         grade,
//         slides,
//         setLoading,
//         setQueueStatus,
//         dispatch,
//         subject,
//         { quiet }
//       );
//       if (!result?.ok) {
//         if (result?.error === "MISSING_FIELDS") {
//           router.replace("/create-lesson");
//           return;
//         }
//         router.replace("/create-lesson");
//         return;
//       }
//       const outline = Array.isArray(result.outline) ? result.outline : [];
//       setDataJSON(outline);
//     } finally {
//       runningRef.current = false;
//     }
//   };

//   // Initial and precondition checks
//   useEffect(() => {
//     setFinalModal?.(false);
//   }, [setFinalModal]);

//   useEffect(() => {
//     if (!socketId || !reqPrompt || (!grade && grade !== 0) || !slides || !subject) {
//       router.replace("/create-lesson");
//     }
//   }, [socketId, reqPrompt, grade, slides, subject, router]);

//   useEffect(() => {
//     runFetch(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Regenerate outline handler
//   const onRegenerate = async (e) => {
//     e?.preventDefault?.();
//     await runFetch(false);
//   };

//   return (
//     <div className="min-h-screen w-full bg-white flex flex-col">
//       <Header />
//       <main className="flex-1 flex flex-col items-center px-4 py-6 overflow-hidden">
//       {/* Main content wrapper */}
//         <div className="w-full max-w-7xl">
//           <h1 className="text-center font-bold text-3xl md:text-4xl text-gray-900">
//             Create a Lessn
//           </h1>
//           <p className="text-center text-gray-500 mt-2 text-sm md:text-base">
//             Create interactive, accurate AI-powered lesson for engaged classrooms.
//           </p>
//           {/* Purple gradient container */}
//           <div
//             className="mt-8 w-full rounded-3xl bg-gradient-to-b from-purple-700 to-purple-300 p-6"
//             // Change the gradient colours above to suit your palette. Adjust p-6
//             // to modify the padding around the internal cards.
//           >
//             {/* Outline header on the gradient background */}
//             <div className="text-center text-white">
//               <h2
//                 className="font-bold text-xl sm:text-2xl md:text-3xl"
//                 // Change font sizes here to adjust heading prominence.
//               >
//                 Outline Preview
//               </h2>
//               {/* Subheading with topic details; uses TopText for reuse */}
//               <TopText />
//             </div>
//             {/* White card that contains slides and bottom buttons */}
//             <div className="mt-6 bg-white rounded-2xl shadow-md overflow-hidden">
//               {/* Slides list: scrollable */}
//               <div
//                 className="p-4 overflow-y-auto max-h-[50vh] md:max-h-[60vh] space-y-6 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent"
//                 // Only this area scrolls. Change max-h- values to let the list grow
//                 // taller or shorter before a scrollbar appears. Use the scrollbar-*
//                 // classes to style the scrollbar (requires Tailwind scrollbar plugin).
//               >
//                 <ul className="space-y-6">
//                   {dataJSON.map((item, index) => (
//                     <SlideComponent
//                       setDataJson={setDataJSON}
//                       points={item.content}
//                       title={item.title}
//                       index={index + 1}
//                       DeleteSlide={DeleteSlide}
//                       key={uuid()}
//                       addSlideBelow={AddSlideBelow}
//                     />
//                   ))}
//                 </ul>
//               </div>
//               {/* Action buttons bar */}
//               <div className="border-t border-gray-200 p-4 flex justify-end rounded-b-2xl">
//                 <ButtonGroup genSlides={genSlides} onRegenerate={onRegenerate} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }
