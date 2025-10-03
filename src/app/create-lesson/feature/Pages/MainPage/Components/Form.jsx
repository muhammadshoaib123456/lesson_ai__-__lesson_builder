"use client";

import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useFormContext } from "./standard/FormContext";
import StandardForm from "./standard/StandardForm";
import { FormInput, FormSelect } from "./FormComponents";  // assuming FormInput & FormSelect are exported from here
// (Note: Adjust the import paths according to your project structure)

export default function Form({ handleSubmit, register, errors, setValue }) {
  const { socketId } = useSelector((state) => state.socket);
  const standardModeEnabled = useSelector((state) => state.standard.standard);  // boolean toggle for standard vs original form

  // Context values for standard form
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
  } = useFormContext();

  // Local state for the original (non-standard) form fields
  const [localGrade, setLocalGrade] = useState("");
  const [localSubject, setLocalSubject] = useState("");
  const [localTopic, setLocalTopic] = useState("");

  // Predefined options for original form dropdowns
  const gradeOptions = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) =>
        i === 0
          ? { value: "Grade Pre-K", label: "Grade Pre-K" }
          : { value: `Grade ${i}`, label: `Grade ${i}` }
      ),
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

  // Determine if the form (either mode) is incomplete
  const isFormIncomplete = () => {
    if (!standardModeEnabled) {
      // Original form requires all three fields
      return !localGrade || !localSubject || !localTopic;
    } else {
      // Standard form requires all selections plus a curriculum point choice
      return (
        !selectedStandard ||
        !selectedSubject ||
        !selectedGrade ||
        !selectedTopic ||
        !selectedCurriculumPoint
      );
    }
  };

  // Reset context state when toggling between standard and original modes
  useEffect(() => {
    if (!standardModeEnabled) {
      // If switching to original form, clear standard form context data
      setSelectedStandard(null);
      setSelectedSubject(null);
      setSelectedGrade(null);
      setSelectedTopic("");
      setSelectedCurriculumPoint(null);
      setStandardOptions([]);  // clear options as well
      setSubjectOptions([]);
      setGradeOptions([]);
      setCurriculumData([]);
      setTopicInput("");
      setComments("");
    } else {
      // If switching to standard form, clear original form local fields
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

  return (
    <div className="lg:overflow-y-auto flex-3 flex-grow max-h-full flex flex-col sm:justify-center">
      <form onSubmit={handleSubmit} className="h-full">
        {standardModeEnabled ? (
          // Standard-based Form (with standards, subjects, grades, etc.)
          <StandardForm register={register} setValue={setValue} />
        ) : (
          // Original Form (simple form with manual grade/subject inputs)
          <>
            {/* Original Form - Grade Selector */}
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

            {/* Original Form - Subject Selector */}
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

            {/* Original Form - Topic Input */}
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
          className="mt-4 rounded-3xl px-6 py-2 font-medium shadow 
                     bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 
                     disabled:text-gray-500 disabled:cursor-not-allowed transition"
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
