/**
 * Fetches relevant data from the backend to populate form fields.
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
      data = await fetch(`${BASE_URL}/standards`, {
        cache: "no-store",
      }).then((res) => res.json());

      return data.standards.map((standard) => ({
        value: standard.standard_id,
        label: standard.title,
      }));

    case "standards/grades":
      params = new URLSearchParams({
        standard_id: selectedStandard,
        subject_id: selectedSubject,
      });

      data = await fetch(`${BASE_URL}/standards/get_grades?${params}`, {
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
      params = new URLSearchParams({
        standard_id: selectedStandard,
      });

      data = await fetch(`${BASE_URL}/standards/get_subjects?${params}`, {
        cache: "no-store",
      }).then((res) => res.json());

      return data.subject.map((subject) => ({
        value: subject.subject_id,
        label: subject.subject_name,
      }));

    case "standards/curriculum":
      params = new URLSearchParams({
        standard_id: selectedStandard,
        grade_id: selectedGrade,
        subject_id: selectedSubject,
        topic: selectedTopic,
      });

      data = await fetch(`${BASE_URL}/standards/get_curriculum?${params}`, {
        cache: "no-store",
      }).then((res) => res.json());

      return data;

    default:
      return [];
  }
};
