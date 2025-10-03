"use client";

import { createContext, useContext, useState } from "react";

const FormContext = createContext();

export function FormProvider({ children }) {
  // Selected values (for Standard mode form)
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedCurriculumPoint, setSelectedCurriculumPoint] = useState(null);

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

  // Topic input text (controlled input for topic search)
  const [topicInput, setTopicInput] = useState("");

  // Optional comments or additional input (not used in standard mode in this context)
  const [comments, setComments] = useState("");

  // Handler: Standard selection changed
  const handleStandardChange = (option) => {
    setSelectedStandard(option);
    // Reset dependent fields when standard changes
    setSelectedSubject(null);
    setSelectedGrade(null);
    setSelectedTopic("");
    setTopicInput("");
    setSelectedCurriculumPoint(null);
    setCurriculumData([]);  // clear any previous curriculum results
    setComments("");
    // Clear dependent dropdown options
    setSubjectOptions([]);
    setGradeOptions([]);
  };

  // Handler: Subject selection changed
  const handleSubjectChange = (option) => {
    setSelectedSubject(option);
    // Reset deeper dependent fields when subject changes
    setSelectedGrade(null);
    setSelectedTopic("");
    setTopicInput("");
    setSelectedCurriculumPoint(null);
    setCurriculumData([]);
    setComments("");
    // Clear grade options for new subject
    setGradeOptions([]);
  };

  // Handler: Grade selection changed
  const handleGradeChange = (option) => {
    setSelectedGrade(option);
    // Reset topic and curriculum data when grade changes
    setSelectedTopic("");
    setTopicInput("");
    setSelectedCurriculumPoint(null);
    setCurriculumData([]);
    setComments("");
  };

  // Handler: Topic search triggered (user entered a topic and clicked search)
  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    // Clear any previously selected curriculum point and data when searching a new topic
    setSelectedCurriculumPoint(null);
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

export const useFormContext = () => useContext(FormContext);
