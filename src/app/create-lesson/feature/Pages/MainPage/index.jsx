"use client";

import { useEffect } from "react";
// Pull the standards form context to reset its state on page load. Without this,
// the standard form retains previous selections when navigating back from other pages.
import { useFormContext as useStdFormContext } from "./Components/standard/FormContext";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setForm } from "../../Redux/slices/PromptSlice.js";
import {
  resetImageData,
  resetReceivedData,
} from "../../Redux/slices/SocketSlice.js";
import { resetOutline } from "../../Redux/slices/OutlineSlice.js";
import Form from "./Components/Form.jsx";
import Image from "./Components/Image.jsx";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { pushToDataLayer } from "../../utils/ganalytics.js";
import { useUsageLimit } from "../../hooks/useUsageLimit.js";
import { flip } from "../../Redux/slices/StandardSlice.js";

export default function MainPage({ setLoading, setGenSlides, setFinalModal }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const dispatch = useDispatch();
  const router = useRouter();
  const standard = useSelector((state) => state.standard.standard);

  // Extract setters from the form context. These setters will be invoked
  // within useEffect below to clear the standards form state when the main
  // page mounts. We destructure them here to avoid re-render triggers.
  const {
    setSelectedStandard,
    setSelectedSubject,
    setSelectedGrade,
    setSelectedTopic,
    setSelectedCurriculumPoint,
    setStandardOptions,
    setSubjectOptions,
    setGradeOptions,
    setCurriculumData,
    setTopicInput,
    setComments,
  } = useStdFormContext();

  const {
    canCreateSlides,
    showLimitReached,
    showLimitWarning,
    loading: usageLoading,
    checkUsage,
  } = useUsageLimit();

  useEffect(() => {
    setLoading(false);
    setGenSlides(false);
    setFinalModal(false);
    dispatch(
      setForm({
        topic: "",
        grade: "",
        slides: "",
        subject: "",
        chosenStandard: "",
        comments: "",
        // Initialise curriculumPoint as an empty array to align with the slice
        curriculumPoint: [],
      })
    );
    dispatch(resetReceivedData());
    dispatch(resetImageData());
    dispatch(resetOutline());
    // Reset all Standards Form state on mount. Clearing these ensures that when
    // the user navigates back from the outline or preview pages, the form
    // appears empty and no curriculum selection modal is displayed.
    setSelectedStandard(null);
    setSelectedSubject(null);
    setSelectedGrade(null);
    setSelectedTopic("");
    setSelectedCurriculumPoint([]);
    setStandardOptions([]);
    setSubjectOptions([]);
    setGradeOptions([]);
    setCurriculumData([]);
    setTopicInput("");
    setComments("");
  }, [
    dispatch,
    setLoading,
    setGenSlides,
    setFinalModal,
    setSelectedStandard,
    setSelectedSubject,
    setSelectedGrade,
    setSelectedTopic,
    setSelectedCurriculumPoint,
    setStandardOptions,
    setSubjectOptions,
    setGradeOptions,
    setCurriculumData,
    setTopicInput,
    setComments,
  ]);

  async function onSubmit(data) {
    if (usageLoading) await checkUsage();
    if (!canCreateSlides) {
      showLimitReached();
      return;
    }

    // Original values
    const topic = data.topic;
    const grade = data.grade;
    const slides = 10;
    const subject = data.subject;

    let chosenStandard = "";
    let comments = "";
    // Curriculum point may be an array, so initialise to empty array
    let curriculumPoint = [];

    // Handle Standards Mode: copy values directly from the form.  We
    // capture the selected standard (label), any comments, and the
    // curriculum points array.  We do not override the topic with
    // curriculum descriptions.
    if (standard) {
      chosenStandard = data.standard || "";
      comments = data.comments || "";
      curriculumPoint = data.curriculumPoint || [];
    }

    // Log final payload for verification
    console.log("Submitting form data:", {
      topic,
      grade,
      subject,
      chosenStandard,
      curriculumPoint,
      comments,
    });

    // Dispatch form to Redux
    dispatch(
      setForm({
        topic,
        grade,
        slides,
        subject,
        chosenStandard,
        comments,
        curriculumPoint,
      })
    );

    await Promise.resolve();

    // Analytics
    if (typeof window !== "undefined") {
      try {
        const ReactGA = (await import("react-ga4")).default;
        ReactGA.event({
          category: "Form",
          action: "Submit",
          label: `Topic: ${topic}, Grade: ${grade}, Subject: ${subject}`,
          value: slides,
        });
      } catch (e) {
        console.error("Analytics error:", e);
      }
      pushToDataLayer({
        event: "formSubmission",
        formType: "mainPage",
        topic,
        grade,
        slides,
        subject,
      });
    }

    showLimitWarning();
    setLoading(true);
    router.push("/create-lesson/outline");
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start px-6 mt-10 mb-10 overflow-hidden">
        <h1 className="mt-2 text-center text-4xl md:text-5xl font-normal text-black">
          Create a Lesson
        </h1>
        <p className="mt-4 text-center text-lg text-purple-700">
          Create interactive, accurate AI-powered lessons for engaged classrooms
        </p>
        {/* Toggle */}
        <div className="mt-6 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Original</span>
          <button
            onClick={() => dispatch(flip())}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
              standard ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                standard ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">Standards</span>
        </div>

        <div className="mt-5 grid flex-1 items-center gap-8 lg:grid-cols-2 w-full max-w-6xl">
          <div className="flex flex-col items-start justify-center">
            <div className="w-full max-w-md">
              <Form
                handleSubmit={handleSubmit(onSubmit)}
                register={register}
                errors={errors}
                setValue={setValue}
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

