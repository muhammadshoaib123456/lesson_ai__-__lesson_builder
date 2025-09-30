"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setForm } from "../../Redux/slices/PromptSlice.js";
import { resetImageData, resetReceivedData } from "../../Redux/slices/SocketSlice.js";
import { resetOutline } from "../../Redux/slices/OutlineSlice.js";
import Form from "./Components/Form.jsx";
import Image from "./Components/Image.jsx";
import { pushToDataLayer } from "../../utils/ganalytics.js";
import { useUsageLimit } from "../../hooks/useUsageLimit.js";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function MainPage({ setLoading, setGenSlides, setFinalModal }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const router = useRouter();

  // canCreateSlides is a BOOLEAN from the hook
  const {
    canCreateSlides,
    showLimitReached,
    showLimitWarning,
    loading: usageLoading,
    checkUsage,
  } = useUsageLimit();

  // Soft gate – profile completion
  const [checkingGate, setCheckingGate] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const p = res.ok ? await res.json() : null;
        if (mounted) setBlocked(!p?.profileComplete);
      } catch {
        if (mounted) setBlocked(false);
      } finally {
        if (mounted) setCheckingGate(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Reset store/UI on mount
  useEffect(() => {
    setLoading(false);
    setGenSlides(false);
    setFinalModal(false);
    dispatch(setForm({ reqPrompt: "", grade: "", slides: "" }));
    dispatch(resetReceivedData());
    dispatch(resetImageData());
    dispatch(resetOutline());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data) {
    if (usageLoading) {
      await checkUsage();
    }

    if (!canCreateSlides) {
      showLimitReached();
      return;
    }

    const reqPrompt = data.topic;
    const grade = data.grade;
    const slides = 10;
    const subject = data.subject;

    // Quick sanity log
    if (process.env.NODE_ENV !== "production") {
      console.log("[MAIN] submit payload", { reqPrompt, grade, slides, subject });
    }

    // Write to Redux before navigating
    dispatch(setForm({ reqPrompt, grade, slides, subject }));

    // Make sure Redux state is flushed before Outline reads it
    await Promise.resolve();

    if (typeof window !== "undefined") {
      try {
        const ReactGA = (await import("react-ga4")).default;
        ReactGA.event({
          category: "Form",
          action: "Submit",
          label: `Topic: ${reqPrompt}, Grade: ${grade}, Subject: ${subject}`,
          value: slides,
        });
      } catch (e) {
        console.error("Analytics error:", e);
      }
      pushToDataLayer({
        event: "formSubmission",
        formType: "mainPage",
        topic: reqPrompt,
        grade,
        slides,
        subject,
      });
    }

    showLimitWarning();
    setLoading(true);
    router.push("/create-lesson/outline");
  }

  const next = "/create-lesson";

  return (
    <div className="min-h-screen w-full overflow-hidden bg-white flex flex-col">
      <Header />

      {!checkingGate && blocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-white text-black w-[92%] max-w-md rounded-2xl shadow-xl border p-6">
            <h3 className="text-xl font-semibold mb-2">Complete your profile</h3>
            <p className="text-gray-700 mb-4">
              Please complete your profile first to access <span className="font-medium">Create a Lesson</span>.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-700"
              >
                Go back
              </button>
              <button
                onClick={() => router.push(`/register?next=${encodeURIComponent(next)}`)}
                className="px-5 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
              >
                Continue onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-start px-6 mt-10 mb-10 overflow-hidden">
        <h1 className="mt-2 text-center text-4xl md:text-5xl font-normal text-black">
          Create a Lesson
        </h1>
        <p className="mt-4 text-center text-lg text-purple-700">
          Create interactive, accurate AI-powered lessons for engaged classrooms
        </p>

        <div className={`mt-5 grid flex-1 items-center gap-8 lg:grid-cols-2 w-full max-w-6xl ${blocked ? "pointer-events-none select-none opacity-60" : ""}`}>
          <div className="flex flex-col items-start justify-center">
            <div className="w-full max-w-md">
              <Form
                handleSubmit={handleSubmit(onSubmit)}
                register={register}
                errors={errors}
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}







































// "use client";

// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { setForm } from "../../Redux/slices/PromptSlice.js";
// import { resetImageData, resetReceivedData } from "../../Redux/slices/SocketSlice.js";
// import { resetOutline } from "../../Redux/slices/OutlineSlice.js";
// import Form from "./Components/Form.jsx";
// import SideText from "./Components/SideText.jsx";
// import Image from "./Components/Image.jsx";
// import { pushToDataLayer } from "../../utils/ganalytics.js";
// import { useUsageLimit } from "../../hooks/useUsageLimit.js";
// import Header from "@/components/Header.jsx";
// import Footer from "@/components/Footer.jsx";

// export default function MainPage({ setLoading, setGenSlides, setFinalModal }) {
//   const { register, handleSubmit, formState: { errors } } = useForm();
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { canCreateSlides, showLimitReached, showLimitWarning } = useUsageLimit();

//   useEffect(() => {
//     setLoading(false);
//     setGenSlides(false);
//     setFinalModal(false);
//     dispatch(setForm({ reqPrompt: "", grade: "", slides: "" }));
//     dispatch(resetReceivedData());
//     dispatch(resetImageData());
//     dispatch(resetOutline());
//   }, []);

//   async function onSubmit(data) {
//     if (!canCreateSlides()) { showLimitReached(); return; }
//     const reqPrompt = data.topic;
//     const grade = data.grade;
//     const slides = 10;
//     const subject = data.subject;

//     dispatch(setForm({ reqPrompt, grade, slides, subject }));

//     if (typeof window !== "undefined") {
//       try {
//         const ReactGA = (await import("react-ga4")).default;
//         ReactGA.event({
//           category: "Form",
//           action: "Submit",
//           label: `Topic: ${reqPrompt}, Grade: ${grade}, Subject: ${subject}`,
//           value: slides,
//         });
//       } catch (e) { console.error("Analytics error:", e); }

//       pushToDataLayer({
//         event: "formSubmission",
//         formType: "mainPage",
//         topic: reqPrompt,
//         grade, slides, subject,
//       });
//     }

//     showLimitWarning();
//     setLoading(true);
//     router.push("/create-lesson/outline");
//   }

//   return (
//     // 👇 wrapper id used to scope the footer-only override to THIS page
//     <div id="page-no-footer-border" className="flex flex-col h-screen overflow-hidden bg-gradient-to-r from-[#500078] to-[#9500DE]">
//       <Header />

//       <main className="flex-1 flex justify-center items-center px-4 overflow-hidden">
//         <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl z-10 flex flex-col lg:flex-row overflow-hidden">
//           <div className="flex flex-col justify-center gap-8 w-full lg:w-1/2 p-8">
//             <SideText />
//             <Form handleSubmit={handleSubmit(onSubmit)} register={register} errors={errors} />
//           </div>
//           <div className="w-full lg:w-1/2 flex justify-center items-center p-8 bg-gradient-to-br from-purple-50 to-purple-100">
//             <Image />
//           </div>
//         </div>
//       </main>

//       <Footer />

//       {/* ✅ Per-page ONLY override for the Footer */}
//       <style jsx global>{`
//         /* affect only the footer rendered inside this page wrapper */
//         #page-no-footer-border footer {
//           background: transparent !important;
//           background-image: none !important;
//           box-shadow: none !important;
//           border: 0 !important;
//         }
//         /* trim extra vertical spacing that can create a “bar/outline” look */
//         #page-no-footer-border footer .container {
//           padding-left: 1.5rem;   /* matches px-6 */
//           padding-right: 1.5rem;
//           padding-top: 0.75rem;   /* py-3/py-4 is fine; keep it small */
//           padding-bottom: 0.75rem;
//         }
//         /* optional: keep inner blocks tight so nothing pokes to bottom corners */
//         #page-no-footer-border footer img { display: block; }
//         #page-no-footer-border footer .mt-10,
//         #page-no-footer-border footer .mb-8,
//         #page-no-footer-border footer .mt-18,
//         #page-no-footer-border footer .pr-20 {
//           margin-top: 0 !important;
//           margin-bottom: 0 !important;
//           padding-right: 0 !important;
//         }
//       `}</style>
//     </div>
//   );
// }

