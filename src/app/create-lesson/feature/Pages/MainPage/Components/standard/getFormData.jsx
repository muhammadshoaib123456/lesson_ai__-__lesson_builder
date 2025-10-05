"use client";

/*
 * getFormData.jsx
 *
 * Centralised helper used by the standards form to fetch dropdown options
 * and curriculum data from the backend.  It accepts a field identifier
 * and optional identifiers for the selected grade, standard, subject and
 * topic.  The behaviour matches the original React implementation.
 */

export const getData = async (
  field,
  selectedGrade = null,
  selectedStandard = null,
  selectedSubject = null,
  selectedTopic = null
) => {
  const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  let data;
  let params;
  switch (field) {
    case "standards":
      // Fetch the list of available standards.  The API returns an array of
      // objects with `standard_id` and `title` properties.  We normalise
      // this into the shape expected by our select components (value/label).
      data = await fetch(`${BASE_URL}/standards`, {
        cache: "no-store",
      }).then((res) => res.json());
      return data.standards.map((standard) => ({
        value: standard.standard_id,
        label: standard.title,
      }));

    case "standards/grades":
      // Fetch grade options for a specific standard and subject.  We pass
      // both identifiers via query parameters.  The API returns grade
      // objects with `grade_id` and `grade_name`.  We produce an array
      // sorted by numerical order (with special handling for Pre‑K and K).
      params = new URLSearchParams({
        standard_id: selectedStandard,
        subject_id: selectedSubject,
      });
      data = await fetch(`${BASE_URL}/standards/get_grades?${params.toString()}`, {
        cache: "no-store",
      }).then((res) => res.json());
      return data.grade
        .map((grade) => ({
          value: grade.grade_id,
          label: `Grade ${grade.grade_name}`,
          sortKey:
            grade.grade_name === "Pre-K"
              ? "00"
              : grade.grade_name === "K"
              ? "00.5"
              : grade.grade_name.padStart(2, "0"),
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ value, label }) => ({ value, label }));

    case "standards/subjects":
      // Fetch subject options for a specific standard.  The API returns
      // subject objects with `subject_id` and `subject_name`.  Convert
      // these into {value,label} pairs.
      params = new URLSearchParams({ standard_id: selectedStandard });
      data = await fetch(`${BASE_URL}/standards/get_subjects?${params.toString()}`, {
        cache: "no-store",
      }).then((res) => res.json());
      return data.subject.map((subject) => ({
        value: subject.subject_id,
        label: subject.subject_name,
      }));

    case "standards/curriculum":
      // Fetch curriculum points for the given combination of standard,
      // grade, subject and topic.  The returned data is passed through
      // unchanged – downstream components will interpret it and display
      // suggested points and the full hierarchy.  Note that this call
      // returns both `suggested` and `points` properties on the top level.
      params = new URLSearchParams({
        standard_id: selectedStandard,
        grade_id: selectedGrade,
        subject_id: selectedSubject,
        topic: selectedTopic,
      });
      data = await fetch(`${BASE_URL}/standards/get_curriculum?${params.toString()}`, {
        cache: "no-store",
      }).then((res) => res.json());
      return data;

    default:
      return [];
  }
};