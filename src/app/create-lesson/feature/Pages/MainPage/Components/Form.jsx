"use client";

/*
 * Form.jsx
 *
 * The top‑level form component responsible for rendering either the
 * original (non‑standards) form or the standards‑mode form.  It pulls
 * context from Redux to determine which mode is active and manages
 * local state for the original form fields.  When the form is
 * submitted, react‑hook‑form collects the values into a `data` object
 * which is then forwarded up to MainPage via handleSubmit.
 */

import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useFormContext as useStdFormContext } from "./standard/FormContext";
import StandardForm from "./standard/StandardForm";
import { FormInput, FormSelect } from "./FormComponents";

export default function Form({ handleSubmit, register, errors, setValue }) {
  const { socketId } = useSelector((state) => state.socket);
  const standardModeEnabled = useSelector((state) => state.standard.standard);

  // Context values for the standards form.  We import everything here so
  // that we can reset it when toggling between modes.  These setters
  // come from the custom FormContext defined in `standard/FormContext.jsx`.
  const {
    selectedStandard,
    selectedSubject,
    selectedGrade,
    selectedTopic,
    selectedCurriculumPoint,
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

  // Local state for the original form (used when standards mode is off).
  const [localGrade, setLocalGrade] = useState("");
  const [localSubject, setLocalSubject] = useState("");
  const [localTopic, setLocalTopic] = useState("");

  // Predefined options for the original form dropdowns.  We memoise
  // these arrays because they never change during the component lifetime.
  // Original form grade options mirror the working React implementation.
  // Provide Pre-K, K (Kindergarten), and grades 1 through 12.
  const gradeOptions = useMemo(
    () => [
      { value: "Grade Pre-K", label: "Grade Pre-K" },
      { value: "Grade K", label: "Grade K" },
      { value: "Grade 1", label: "Grade 1" },
      { value: "Grade 2", label: "Grade 2" },
      { value: "Grade 3", label: "Grade 3" },
      { value: "Grade 4", label: "Grade 4" },
      { value: "Grade 5", label: "Grade 5" },
      { value: "Grade 6", label: "Grade 6" },
      { value: "Grade 7", label: "Grade 7" },
      { value: "Grade 8", label: "Grade 8" },
      { value: "Grade 9", label: "Grade 9" },
      { value: "Grade 10", label: "Grade 10" },
      { value: "Grade 11", label: "Grade 11" },
      { value: "Grade 12", label: "Grade 12" },
    ],
    []
  );
  const subjectOptions = useMemo(
    () => [
      { value: "Math", label: "Math" },
      { value: "Science", label: "Science" },
      { value: "English Language Arts", label: "English Language Arts" },
    ],
    []
  );

  /**
   * Determine whether the form is incomplete.  For the original form we
   * require all three inputs (grade, subject and topic).  For the
   * standards form we require all selections plus at least one
   * curriculum point.
   */
  const isFormIncomplete = () => {
    if (!standardModeEnabled) {
      return !localGrade || !localSubject || !localTopic;
    } else {
      // Standards mode: ensure all selections are made and at least one
      // curriculum point has been chosen.  selectedCurriculumPoint may
      // be an array; treat an empty array as incomplete.
      // Determine if no curriculum point has been selected.  In the
      // standards form we store a single point object (or null).  We
      // also support arrays for backwards compatibility.  Treat an
      // empty object or empty array as no selection.
      const noCurriculum =
        !selectedCurriculumPoint ||
        (Array.isArray(selectedCurriculumPoint) &&
          selectedCurriculumPoint.length === 0) ||
        (typeof selectedCurriculumPoint === "object" &&
          !Array.isArray(selectedCurriculumPoint) &&
          Object.keys(selectedCurriculumPoint).length === 0);
      return (
        !selectedStandard ||
        !selectedSubject ||
        !selectedGrade ||
        !selectedTopic ||
        noCurriculum
      );
    }
  };

  /**
   * When toggling between standard and original modes, reset the
   * appropriate state.  This effect mirrors the logic from the React
   * implementation.  Switching to the original form clears the
   * standards context, and switching to the standards form clears the
   * local inputs.
   */
  useEffect(() => {
    if (!standardModeEnabled) {
      // If switching to original form, clear the standards context
      setSelectedStandard(null);
      setSelectedSubject(null);
      setSelectedGrade(null);
      setSelectedTopic("");
      setSelectedCurriculumPoint(null);
      setStandardOptions([]);
      setSubjectOptions([]);
      setGradeOptions([]);
      setCurriculumData([]);
      setTopicInput("");
      setComments("");
    } else {
      // If switching to standards form, clear local inputs
      setLocalGrade("");
      setLocalSubject("");
      setLocalTopic("");
    }
  }, [
    standardModeEnabled,
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

  /*
   * Register hidden label fields.  react‑hook‑form only tracks fields
   * that have been registered.  Even though we set the values via
   * StandardForm effects, we register them here so that when the
   * standards form is submitted the `gradeLabel` and `subjectLabel`
   * properties are included in the `data` object.
   */
  useEffect(() => {
    // Register the curriculumPoint field so that selected curriculum
    // points are included in the submitted data.  Other label fields
    // (gradeLabel, subjectLabel, standardLabel) are no longer used.
    register("curriculumPoint");
  }, [register]);

  return (
    <div className="lg:overflow-y-auto flex-3 flex-grow max-h-full flex flex-col sm:justify-center">
      <form onSubmit={handleSubmit} className="h-full">
        {standardModeEnabled ? (
          // Standards form (with cascading selects and curriculum selection)
          <StandardForm register={register} setValue={setValue} />
        ) : (
          // Original form (simple grade/subject/topic inputs)
          <>
            {/* Original Form – Grade Selector */}
            <FormSelect
              label="Select Grade"
              name="grade"
              options={gradeOptions}
              value={gradeOptions.find((g) => g.value === localGrade) || null}
              onChange={(opt) => setLocalGrade(opt?.value ?? "")}
              register={register}
              placeholder="Select a grade..."
              required
            />

            {/* Original Form – Subject Selector */}
            {localGrade && (
              <FormSelect
                label="Select Subject"
                name="subject"
                options={subjectOptions}
                value={subjectOptions.find((s) => s.value === localSubject) || null}
                onChange={(opt) => setLocalSubject(opt?.value ?? "")}
                register={register}
                placeholder="Select a subject..."
                required
              />
            )}

            {/* Original Form – Topic Input */}
            {localSubject && (
              <FormInput
                label="Enter Topic"
                name="topic"
                placeholder="e.g. Big Bang Theory"
                value={localTopic}
                onChange={(e) => setLocalTopic(e.target.value)}
                register={register}
                required
              />
            )}
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 rounded-3xl px-6 py-2 font-medium shadow bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
          disabled={!socketId || isFormIncomplete()}
        >
          Generate Outline
        </button>
      </form>
    </div>
  );
}

























// "use client";

// import { useEffect, useState } from "react";
// import FormSelectDisabled, { FormInput, FormSelect } from "./FormComponents.jsx";
// import { useSelector } from "react-redux";

// export default function Form({ handleSubmit, register, errors }) {
//   const { socketId } = useSelector((state) => state.socket);
//   const [selectedGrade, setSelectedGrade] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [selectedTopic, setSelectedTopic] = useState("");
//   const [refresh, setRefresh] = useState(false);

//   const handleGradeChange = (value) => {
//     setRefresh(true);
//     setSelectedGrade(value?.value ?? "");
//     setSelectedSubject("");
//     setSelectedTopic("");
//   };

//   const handleSubjectChange = (value) => {
//     setSelectedSubject(value?.value ?? "");
//   };

//   const handleTopicChange = (value) => {
//     setSelectedTopic(value ?? "");
//   };

//   const isFormIncomplete = () => {
//     return !selectedGrade || !selectedSubject || !selectedTopic;
//   };

//   const getOptions = async (field) => {
//     try {
//       switch (field) {
//         case "grade": {
//           const order = [
//             "Pre-K",
//             "Kindergarten",
//             "First Grade",
//             "Second Grade",
//             "Third Grade",
//             "Fourth Grade",
//             "Fifth Grade",
//             "Sixth Grade",
//             "Seventh Grade",
//             "Eighth Grade",
//             "High school",
//           ];

//           const res = await fetch(`/api/lesson-builder/grades`, { cache: "no-store" });
//           const data = res.ok ? await res.json() : { grade: [] };
//           const gradesArray = Array.isArray(data.grade) ? data.grade : [];

//           // Coerce strings → objects
//           const normalized = gradesArray.map((g) => (typeof g === "string" ? { grade: g } : g));

//           const sorted = normalized
//             .slice()
//             .sort((a, b) => {
//               const ia = order.indexOf(a?.grade ?? "");
//               const ib = order.indexOf(b?.grade ?? "");
//               const sa = ia === -1 ? Number.POSITIVE_INFINITY : ia;
//               const sb = ib === -1 ? Number.POSITIVE_INFINITY : ib;
//               return sa - sb;
//             })
//             .map((g) => ({ value: g.grade, label: g.grade }))
//             .filter((g) => g.value);

//           return sorted;
//         }

//         case "subject": {
//           if (!selectedGrade) return [];
//           const res2 = await fetch(
//             `/api/lesson-builder/subjects?grade=${encodeURIComponent(selectedGrade)}`,
//             { cache: "no-store" }
//           );
//           const data2 = res2.ok ? await res2.json() : { subjects: [] };
//           const subjectsArray = Array.isArray(data2.subjects) ? data2.subjects : [];

//           return subjectsArray
//             .map((s) => (typeof s === "string" ? s : s?.subject))
//             .filter(Boolean)
//             .map((subject) => ({ value: subject, label: subject }));
//         }

//         default:
//           return [];
//       }
//     } catch (e) {
//       console.error("getOptions error:", e);
//       return [];
//     }
//   };

//   useEffect(() => {
//     setRefresh(false);
//   }, [selectedGrade]);

//   return (
//     <div className="object-contain flex-shrink max-h-full flex-2 flex flex-col sm:justify-center">
//       <form onSubmit={handleSubmit} className="h-full">
//         <FormSelect
//           label="Grade"
//           name="grade"
//           options={getOptions("grade")}
//           value={selectedGrade}
//           onChange={handleGradeChange}
//           register={register}
//           required
//         />

//         {!refresh && selectedGrade && (
//           <FormSelect
//             placeholder="Select..."
//             label="Select Subject"
//             name="subject"
//             options={getOptions("subject")}
//             value={selectedSubject}
//             onChange={handleSubjectChange}
//             register={register}
//             required
//           />
//         )}

//         {selectedSubject && (
//           <FormInput
//             label="Enter Topic"
//             name="topic"
//             placeholder={"Big Bang Theory"}
//             value={selectedTopic}
//             onChange={(e) => handleTopicChange(e.target.value)}
//             register={register}
//             required
//           />
//         )}

//         <button
//           className="btn btn-md rounded-3xl flex justify-center h-2 w-40 hover:bg-purple-primary bg-purple-secondary group items-center"
//           type="submit"
//           disabled={!socketId || isFormIncomplete()}
//         >
//           <span className="h-full w-full items-center text-white duration-100 justify-center text-xs flex">
//             Generate Outline
//           </span>
//         </button>
//       </form>
//     </div>
//   );
// }
