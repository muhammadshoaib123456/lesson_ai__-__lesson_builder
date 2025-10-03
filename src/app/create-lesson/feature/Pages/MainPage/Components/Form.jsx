"use client";

import { useState, useMemo } from "react";
import { FormInput, FormSelect } from "./FormComponents.jsx";
import { useSelector } from "react-redux";

// --- helpers (same retry/timeout behavior as your original) ---
async function fetchJSONWithTimeout(
  url,
  { timeoutMs = 8000, headers, signal, ...init } = {},
  retry = true
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: headers ?? { Accept: "application/json" },
      signal: signal ?? controller.signal,
      ...init,
    });
    clearTimeout(timer);

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const isJSON = contentType.includes("application/json");

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      const err = new Error(`HTTP ${res.status}${txt ? `: ${txt.slice(0, 200)}` : ""}`);
      err.status = res.status;
      err.body = txt;
      throw err;
    }

    if (isJSON) return res.json();

    const raw = await res.text();
    return { _nonJSON: raw, status: res.status, contentType };
  } catch (err) {
    clearTimeout(timer);
    const transient =
      err?.name === "AbortError" ||
      (typeof err?.message === "string" && /network|timeout|fetch failed/i.test(err.message));
    if (retry && transient) {
      return fetchJSONWithTimeout(url, { timeoutMs, headers, signal, ...init }, false);
    }
    throw err;
  }
}

async function fetchSubjectsForGrade(BACKEND, selectedGrade) {
  const enc = encodeURIComponent(selectedGrade);
  const res1 = await fetchJSONWithTimeout(`${BACKEND}/get_subject?grade=${enc}`, { timeoutMs: 8000 });
  if (!res1?._nonJSON) return res1;
  const res2 = await fetchJSONWithTimeout(`${BACKEND}/get_subject?grade="${enc}"`, { timeoutMs: 8000 });
  return res2;
}

export default function Form({ handleSubmit, register }) {
  const { socketId } = useSelector((state) => state.socket);

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const gradeOrder = useMemo(
    () => [
      "Pre-K","Kindergarten","First Grade","Second Grade","Third Grade",
      "Fourth Grade","Fifth Grade","Sixth Grade","Seventh Grade","Eighth Grade","High school",
    ],
    []
  );

  const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL;

  const handleGradeChange = (value) => {
    setSelectedGrade(value?.value ?? "");
    setSelectedSubject("");
    setSelectedTopic("");
  };
  const handleSubjectChange = (value) => {
    setSelectedSubject(value?.value ?? "");
    setSelectedTopic("");
  };
  const handleTopicChange = (value) => setSelectedTopic(value ?? "");

  const isFormIncomplete = () => !selectedGrade || !selectedSubject || !selectedTopic;

  const normalizeGrades = (data) => {
    let gradesArray = [];
    if (data && !data._nonJSON) {
      if (Array.isArray(data)) gradesArray = data;
      else if (Array.isArray(data.grade)) gradesArray = data.grade;
      else if (Array.isArray(data.grades)) gradesArray = data.grades;
    }
    return gradesArray
      .map((g) => (typeof g === "string" ? { grade: g } : g))
      .filter(Boolean);
  };

  const normalizeSubjects = (data) => {
    let arr = [];
    if (data && !data._nonJSON) {
      if (Array.isArray(data)) arr = data;
      else if (Array.isArray(data.subjects)) arr = data.subjects;
      else if (Array.isArray(data.subject)) arr = data.subject;
      else if (Array.isArray(data.topics)) arr = data.topics;
    }
    return arr
      .map((s) => (typeof s === "string" ? s : s?.subject))
      .filter((s) => typeof s === "string" && s.trim().length > 0);
  };

  const getOptions = async (field) => {
    try {
      if (!BACKEND) {
        console.error("Missing NEXT_PUBLIC_SERVER_URL");
        return [];
      }

      switch (field) {
        case "grade": {
          const data = await fetchJSONWithTimeout(`${BACKEND}/get_grades`, { timeoutMs: 8000 });
          if (data?._nonJSON) return [];
          const normalized = normalizeGrades(data);
          return normalized
            .slice()
            .sort((a, b) => {
              const ia = gradeOrder.indexOf(a?.grade ?? "");
              const ib = gradeOrder.indexOf(b?.grade ?? "");
              const sa = ia === -1 ? Number.POSITIVE_INFINITY : ia;
              const sb = ib === -1 ? Number.POSITIVE_INFINITY : ib;
              return sa - sb;
            })
            .map((g) => ({ value: g.grade, label: g.grade }))
            .filter((g) => g.value);
        }
        case "subject": {
          if (!selectedGrade) return [];
          const data2 = await fetchSubjectsForGrade(BACKEND, selectedGrade);
          if (data2?._nonJSON) return [];
          const subjects = normalizeSubjects(data2);
          return subjects.map((subject) => ({ value: subject, label: subject }));
        }
        default:
          return [];
      }
    } catch (e) {
      console.error("getOptions error:", e);
      return [];
    }
  };

  return (
    <div className="object-contain flex-shrink max-h-full flex-2 flex flex-col sm:justify-center">
      <form onSubmit={handleSubmit} className="h-full">
        <FormSelect
          label="Grade"
          name="grade"
          options={getOptions("grade")}
          value={selectedGrade}
          onChange={handleGradeChange}
          register={register}
          required
        />

        {selectedGrade && (
          <FormSelect
            placeholder="Select..."
            label="Select Subject"
            name="subject"
            options={getOptions("subject")}
            value={selectedSubject}
            onChange={handleSubjectChange}
            register={register}
            required
          />
        )}

        {selectedSubject && (
          <FormInput
            label="Enter Topic"
            name="topic"
            placeholder="Big Bang Theory"
            value={selectedTopic}
            onChange={(e) => handleTopicChange(e.target.value)}
            register={register}
            required
            className="rounded-3xl border-purple-600 focus:border-purple-700 focus:ring-2 focus:ring-purple-700 hover:border-purple-600"
          />
        )}

        <button
          className={`mt-4 rounded-2xl px-4 py-2 font-medium shadow transition 
            ${isFormIncomplete()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
              : "bg-black text-white hover:bg-gray-800 cursor-pointer opacity-100"}`}
          type="submit"
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
