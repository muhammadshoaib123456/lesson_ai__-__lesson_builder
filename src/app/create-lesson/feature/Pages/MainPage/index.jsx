"use client";

import { useEffect, useRef } from "react";
import { useFormContext as useStdFormContext } from "./Components/standard/FormContext";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setForm } from "../../Redux/slices/PromptSlice.js";
import { resetImageData, resetReceivedData } from "../../Redux/slices/SocketSlice.js";
import { resetOutline } from "../../Redux/slices/OutlineSlice.js";
import Form from "./Components/Form.jsx";
import Image from "./Components/Image.jsx";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { pushToDataLayer } from "../../utils/ganalytics.js";
import { useUsageLimit } from "../../hooks/useUsageLimit.js";
import { flip } from "../../Redux/slices/StandardSlice.js";

// Helper functions to fetch curriculum options.  These mirror the
// implementations used in the registration and profile screens.  They
// return arrays of objects with value/label fields for use with
// react-select.
async function fetchStandardOptions(BACKEND) {
  try {
    const res = await fetch(`${BACKEND}/standards`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data.standards)) arr = data.standards;
    return arr
      .map((s) => {
        const value = s.standard_id ?? s.value ?? s.id ?? s.label ?? s.title;
        const label = s.title ?? s.label ?? s.name ?? s.title;
        if (!value || !label) return null;
        return { value: String(value), label: String(label) };
      })
      .filter(Boolean);
  } catch (_) {
    return [];
  }
}

async function fetchSubjectOptions(BACKEND, standard) {
  try {
    const params = new URLSearchParams({ standard_id: standard });
    const res = await fetch(`${BACKEND}/standards/get_subjects?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data.subjects)) arr = data.subjects;
    else if (Array.isArray(data.subject)) arr = data.subject;
    return arr
      .map((s) => {
        const value = s.subject_id ?? s.value ?? s.id ?? s.subject ?? s.subject_name;
        const label = s.subject_name ?? s.label ?? s.name ?? s.title ?? s.subject;
        if (!value || !label) return null;
        return { value: String(value), label: String(label) };
      })
      .filter(Boolean);
  } catch (_) {
    return [];
  }
}

async function fetchGradeOptions(BACKEND, standard, subject) {
  try {
    const params = new URLSearchParams({ standard_id: standard, subject_id: subject });
    const res = await fetch(`${BACKEND}/standards/get_grades?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data.grades)) arr = data.grades;
    else if (Array.isArray(data.grade)) arr = data.grade;
    return arr
      .map((g) => {
        const value = g.grade_id ?? g.value ?? g.id ?? g.grade ?? g.grade_name;
        const gn = g.grade_name ?? g.name ?? g.title ?? g.grade;
        if (!value || !gn) return null;
        let sortKey;
        if (gn === "Pre-K" || gn === "Pre‑K") sortKey = "00";
        else if (gn === "K") sortKey = "00.5";
        else {
          const num = String(gn).replace(/[^0-9]/g, "");
          sortKey = num.padStart(2, "0");
        }
        const label = `Grade ${gn}`;
        return { value: String(value), label: String(label), sortKey };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ value, label }) => ({ value, label }));
  } catch (_) {
    return [];
  }
}

/*
 * MainPage
 *
 * The entry point for lesson creation.  This component resets form
 * state on mount and preloads any saved curriculum defaults from
 * the user's profile.  If defaults are present, the standards
 * toggle is enabled automatically and the corresponding fields in
 * the standards form are prefilled.  Users can still edit these
 * values before submitting the form to generate a lesson outline.
 */

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

  // Extract setters from the standards form context.  These are used
  // to populate default selections when returning to the page.
  const {
    selectedStandard,
    selectedSubject,
    selectedGrade,
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

  // Persist the last selected standard/subject/grade across toggle changes.
  const storedSelectionsRef = useRef({ standard: null, subject: null, grade: null });
  const prevStandardRef = useRef(standard);

  // Update stored selections when toggling from standards mode to core and restore when toggling back.
  useEffect(() => {
    // If previously in standard mode and now toggled off, store current selections
    if (prevStandardRef.current && !standard) {
      storedSelectionsRef.current = {
        standard: selectedStandard || null,
        subject: selectedSubject || null,
        grade: selectedGrade || null,
      };
    }
    // If previously in core mode and now toggled on, restore stored selections
    if (!prevStandardRef.current && standard) {
      const { standard: st, subject: sub, grade: gd } = storedSelectionsRef.current;
      if (st) {
        setSelectedStandard(st);
        setValue && setValue("standard", st.label);
      }
      if (sub) {
        setSelectedSubject(sub);
        setValue && setValue("subject", sub.label);
      }
      if (gd) {
        setSelectedGrade(gd);
        setValue && setValue("grade", gd.label);
      }
    }
    prevStandardRef.current = standard;
    // dependencies: run whenever standard changes
  }, [standard, selectedStandard, selectedSubject, selectedGrade, setSelectedStandard, setSelectedSubject, setSelectedGrade, setValue]);

  const {
    canCreateSlides,
    showLimitReached,
    showLimitWarning,
    loading: usageLoading,
    checkUsage,
  } = useUsageLimit();

  // Reset page state on mount and load defaults from profile
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
        curriculumPoint: [],
      })
    );
    dispatch(resetReceivedData());
    dispatch(resetImageData());
    dispatch(resetOutline());
    // Clear all standards form context
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
    // Ensure the toggle defaults to state standards on initial mount.  If
    // the current mode is core curriculum (standard=false), flip it so
    // that the user sees the standards form by default.
    if (!standard) dispatch(flip());
    // Load defaults from profile and set the form fields if necessary
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;
        const p = await res.json();
        if (p && p.defaultStandard) {
          const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL;
          // Fetch the full list of standards to resolve the label for the stored ID
          const stdList = await fetchStandardOptions(BACKEND);
          const stdObj = stdList.find((o) => o.value === String(p.defaultStandard));
          let resolvedStandard;
          if (stdObj) {
            setSelectedStandard(stdObj);
            setValue("standard", stdObj.label);
            resolvedStandard = stdObj;
          } else {
            const fallback = { value: p.defaultStandard, label: p.defaultStandard };
            setSelectedStandard(fallback);
            setValue("standard", fallback.label);
            resolvedStandard = fallback;
          }
          let resolvedSubject = null;
          if (p.defaultSubject) {
            const subjList = await fetchSubjectOptions(BACKEND, p.defaultStandard);
            const subjObj = subjList.find((o) => o.value === String(p.defaultSubject));
            if (subjObj) {
              setSelectedSubject(subjObj);
              setValue("subject", subjObj.label);
              resolvedSubject = subjObj;
            } else {
              const fallbackSubj = { value: p.defaultSubject, label: p.defaultSubject };
              setSelectedSubject(fallbackSubj);
              setValue("subject", fallbackSubj.label);
              resolvedSubject = fallbackSubj;
            }
          }
          let resolvedGrade = null;
          if (p.defaultGrade) {
            const gradeList = await fetchGradeOptions(BACKEND, p.defaultStandard, p.defaultSubject);
            const gradeObj = gradeList.find((o) => o.value === String(p.defaultGrade));
            if (gradeObj) {
              setSelectedGrade(gradeObj);
              setValue("grade", gradeObj.label);
              resolvedGrade = gradeObj;
            } else {
              const fallbackGrade = { value: p.defaultGrade, label: p.defaultGrade };
              setSelectedGrade(fallbackGrade);
              setValue("grade", fallbackGrade.label);
              resolvedGrade = fallbackGrade;
            }
          }
          storedSelectionsRef.current = {
            standard: resolvedStandard,
            subject: resolvedSubject,
            grade: resolvedGrade,
          };
        }
      } catch {
        /* ignore errors */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, setLoading, setGenSlides, setFinalModal, setSelectedStandard, setSelectedSubject, setSelectedGrade, setSelectedTopic, setSelectedCurriculumPoint, setStandardOptions, setSubjectOptions, setGradeOptions, setCurriculumData, setTopicInput, setComments]);

  async function onSubmit(data) {
    if (usageLoading) await checkUsage();
    if (!canCreateSlides) {
      showLimitReached();
      return;
    }
    const topic = data.topic;
    const grade = data.grade;
    const slides = 10;
    const subject = data.subject;
    // Always capture standards-related values if provided.  Do not depend
    // on the Redux toggle here because it may not update synchronously.
    let chosenStandard = data.standard || "";
    let comments = data.comments || "";
    let curriculumPoint = data.curriculumPoint || [];

    // Log the payload being sent to the outline page for debugging
    if (process.env.NODE_ENV !== "production") {
      console.log("[MAIN] Submitting form data:", {
        topic,
        grade,
        subject,
        chosenStandard,
        curriculumPoint,
        comments,
      });
    }
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
          <span className="text-sm font-medium text-gray-700"> Core Curriculum</span>
          <button
            onClick={() => dispatch(flip())}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${standard ? "bg-purple-600" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${standard ? "translate-x-7" : "translate-x-1"}`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">State Standards</span>
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