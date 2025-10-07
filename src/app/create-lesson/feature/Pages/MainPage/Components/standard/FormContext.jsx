"use client";

/*
 * FormContext.jsx
 *
 * This context manages all of the shared state for the Standards‑mode form.
 * It closely mirrors the behaviour found in the working React application.
 *
 * Responsibilities:
 *   • Keep track of which standard, subject and grade the user has selected.
 *   • Store the topic query and any curriculum data returned from the backend.
 *   • Manage dropdown options and loading flags while data is being fetched.
 *   • Expose setter functions so child components can update the state.
 */

import { createContext, useContext, useState } from "react";

// Create a context instance.  We export useFormContext below as a convenience
// hook so consuming components don't need to import useContext repeatedly.
const FormContext = createContext();

export function FormProvider({ children }) {
  // Selected values (for Standards mode form).  We store the entire option
  // objects (with both label and value) so we can easily display labels and
  // retrieve the underlying IDs when fetching data.
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  // Store selected curriculum points as an array.  The original
  // implementation kept a single object; however, the React version
  // allows selecting multiple curriculum points.  Initialise to an
  // empty array for consistency.
  const [selectedCurriculumPoint, setSelectedCurriculumPoint] = useState([]);

  // Dropdown options for each selector
  const [standardOptions, setStandardOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);

  // Fetched curriculum data (standards matching the topic search)
  const [curriculumData, setCurriculumData] = useState([]);

  // Loading states for async fetches
  const [loadingStandards, setLoadingStandards] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // Topic input text (controlled input for topic search).  We separate
  // `topicInput` from `selectedTopic` so users can type freely without
  // triggering a search until they click the search button.
  const [topicInput, setTopicInput] = useState("");

  // Optional comments or additional input (not used in standards mode in this context)
  const [comments, setComments] = useState("");

  /*
   * Handler: Standard selection changed
   * When the selected standard changes, we clear all dependent selections
   * (subject, grade, topic, curriculum point) and clear previously
   * fetched data.  We also reset the dropdown options so new subjects and
   * grades can be fetched for the newly selected standard.
   */
  const handleStandardChange = (option) => {
    // Always set a new object so that React recognises a state change even when
    // the user reselects the same option.  Without this, reselecting the
    // existing option would not trigger downstream effects and the subject
    // dropdown would remain empty.
    setSelectedStandard(option ? { ...option } : null);
    // Reset dependent fields when standard changes
    setSelectedSubject(null);
    setSelectedGrade(null);
    setSelectedTopic("");
    setTopicInput("");
    setSelectedCurriculumPoint([]);
    setCurriculumData([]);
    setComments("");
    // Clear dependent dropdown options
    setSubjectOptions([]);
    setGradeOptions([]);
  };

  /*
   * Handler: Subject selection changed
   * When the subject changes, clear deeper dependent fields (grade, topic,
   * curriculum point, comments) and clear grade options so they can be
   * reloaded for the new subject.
   */
  const handleSubjectChange = (option) => {
    // Use a cloned object to ensure state changes propagate even when
    // reselecting the same subject.  This triggers downstream effects
    // correctly.
    setSelectedSubject(option ? { ...option } : null);
    setSelectedGrade(null);
    setSelectedTopic("");
    setTopicInput("");
    setSelectedCurriculumPoint([]);
    setCurriculumData([]);
    setComments("");
    setGradeOptions([]);
  };

  /*
   * Handler: Grade selection changed
   * When the grade changes, clear the topic, curriculum data and any
   * previously selected curriculum points.  Topic input is also reset
   * because a new grade might warrant a different search query.
   */
  const handleGradeChange = (option) => {
    // Clone the grade option to force a state update.  This ensures that
    // dependent values reset properly when the same grade is selected.
    setSelectedGrade(option ? { ...option } : null);
    setSelectedTopic("");
    setTopicInput("");
    setSelectedCurriculumPoint([]);
    setCurriculumData([]);
    setComments("");
  };

  /*
   * Handler: Topic search triggered
   * When the user enters a topic and clicks search, update
   * `selectedTopic` (which triggers a curriculum fetch) and clear
   * previously selected curriculum points and data.  We do not clear
   * `topicInput` here so the input box retains its value.
   */
  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    setSelectedCurriculumPoint([]);
    setCurriculumData([]);
  };

  return (
    <FormContext.Provider
      value={{
        // selected values
        selectedStandard,
        selectedSubject,
        selectedGrade,
        selectedTopic,
        selectedCurriculumPoint,
        // dropdown options
        standardOptions,
        subjectOptions,
        gradeOptions,
        curriculumData,
        // loading states
        loadingStandards,
        loadingSubjects,
        loadingGrades,
        // other state
        topicInput,
        comments,
        // state setters (if needed outside)
        setSelectedStandard,
        setSelectedSubject,
        setSelectedGrade,
        setSelectedTopic,
        setSelectedCurriculumPoint,
        setStandardOptions,
        setSubjectOptions,
        setGradeOptions,
        setCurriculumData,
        setLoadingStandards,
        setLoadingSubjects,
        setLoadingGrades,
        setTopicInput,
        setComments,
        // handlers
        handleStandardChange,
        handleSubjectChange,
        handleGradeChange,
        handleTopicChange,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

// Convenience hook for consuming the context
export const useFormContext = () => useContext(FormContext);