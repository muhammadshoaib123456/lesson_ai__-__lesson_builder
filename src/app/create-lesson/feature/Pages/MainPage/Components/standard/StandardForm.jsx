"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormContext } from "./FormContext";
import { getData } from "./getFormData";
import { FormInput } from "./standard-components/FormInput";
import { FormSelect } from "./standard-components/FormSelect";
import { FormCurriculumPointSelectionModal } from "./standard-components/FormCurriculumPointSelectionModal";
import { FormDiv } from "./standard-components/FormDiv";

const StandardForm = ({ register, setValue }) => {
  const standardModeEnabled = useSelector((state) => state.standard.standard);  // boolean flag if "Standard" mode is active

  const {
    // selected values from context
    selectedStandard,
    selectedSubject,
    selectedGrade,
    selectedTopic,
    selectedCurriculumPoint,
    // option lists and loading states from context
    standardOptions,
    subjectOptions,
    gradeOptions,
    curriculumData,
    loadingStandards,
    loadingSubjects,
    loadingGrades,
    // handlers from context
    handleStandardChange,
    handleSubjectChange,
    handleGradeChange,
    handleTopicChange,
    // topic input text and setter
    topicInput,
    setTopicInput,
    // to update options lists
    setStandardOptions,
    setSubjectOptions,
    setGradeOptions,
    setCurriculumData,
    setLoadingStandards,
    setLoadingSubjects,
    setLoadingGrades,
  } = useFormContext();

  // State to control the curriculum selection modal visibility
  const [enlargeCurriculumModal, setEnlargeCurriculumModal] = useState(false);

  /** Fetch the list of standards on initial load (when standard mode is enabled) */
  useEffect(() => {
    if (standardModeEnabled) {
      const fetchStandardOptions = async () => {
        setLoadingStandards(true);
        try {
          const options = await getData("standards");
          setStandardOptions(options);  // use fetched {value, label} list directly
        } catch (error) {
          console.error("Error fetching standard options:", error);
          setStandardOptions([]);
        } finally {
          setLoadingStandards(false);
        }
      };
      fetchStandardOptions();
    }
  }, [standardModeEnabled, setStandardOptions, setLoadingStandards]);

  /** Fetch subjects whenever a standard is selected */
  useEffect(() => {
    if (standardModeEnabled && selectedStandard) {
      const fetchSubjectOptions = async () => {
        setLoadingSubjects(true);
        try {
          const options = await getData(
            "standards/subjects",
            null,
            selectedStandard.value  // pass selected standard ID
          );
          setSubjectOptions(options);
        } catch (error) {
          console.error("Error fetching subject options:", error);
          setSubjectOptions([]);
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchSubjectOptions();
    }
  }, [standardModeEnabled, selectedStandard, setSubjectOptions, setLoadingSubjects]);

  /** Fetch grades whenever a subject is selected (and a standard is already selected) */
  useEffect(() => {
    if (standardModeEnabled && selectedStandard && selectedSubject) {
      const fetchGradeOptions = async () => {
        setLoadingGrades(true);
        try {
          const options = await getData(
            "standards/grades",
            null,
            selectedStandard.value,
            selectedSubject.value
          );
          setGradeOptions(options);
        } catch (error) {
          console.error("Error fetching grade options:", error);
          setGradeOptions([]);
        } finally {
          setLoadingGrades(false);
        }
      };
      fetchGradeOptions();
    }
  }, [standardModeEnabled, selectedStandard, selectedSubject, setGradeOptions, setLoadingGrades]);

  /** Fetch relevant curriculum points whenever a topic search is triggered */
  useEffect(() => {
    if (
      standardModeEnabled &&
      selectedStandard &&
      selectedSubject &&
      selectedGrade &&
      selectedTopic
    ) {
      const fetchCurriculumData = async () => {
        try {
          const data = await getData(
            "standards/curriculum",
            selectedGrade.value,       // grade ID
            selectedStandard.value,    // standard ID
            selectedSubject.value,     // subject ID
            selectedTopic              // topic query
          );
          setCurriculumData(data || []);
          if (data) {
            // Open the modal to select a specific curriculum point after fetching results
            setEnlargeCurriculumModal(true);
          }
        } catch (error) {
          console.error("Error fetching curriculum data:", error);
          setCurriculumData([]);
        }
      };
      fetchCurriculumData();
    }
  }, [
    standardModeEnabled,
    selectedStandard,
    selectedSubject,
    selectedGrade,
    selectedTopic,
    setCurriculumData,
  ]);

  return (
    <div>
      {/* Standard Selector */}
      <FormSelect
        label="Select Standard"
        name="standard"
        options={standardOptions}
        value={
          // Find the option object that matches the selected standard (by value)
          standardOptions.find((opt) => opt.value === selectedStandard?.value) || null
        }
        onChange={handleStandardChange}
        register={register}
        loading={loadingStandards}
        placeholder="Select a standard..."
        required
      />

      {/* Subject Selector (shown after a standard is chosen) */}
      {selectedStandard && (
        <FormSelect
          label="Select Subject"
          name="subject"
          options={subjectOptions}
          value={
            subjectOptions.find((opt) => opt.value === selectedSubject?.value) || null
          }
          onChange={handleSubjectChange}
          register={register}
          loading={loadingSubjects}
          placeholder="Select a subject..."
          required
        />
      )}

      {/* Grade Selector (shown after a subject is chosen) */}
      {selectedStandard && selectedSubject && (
        <FormSelect
          label="Select Grade"
          name="grade"
          options={gradeOptions}
          value={
            gradeOptions.find((opt) => opt.value === selectedGrade?.value) || null
          }
          onChange={handleGradeChange}
          register={register}
          loading={loadingGrades}
          placeholder="Select a grade..."
          required
        />
      )}

      {/* Topic Input & Search Button (shown after a grade is chosen) */}
      {selectedStandard && selectedSubject && selectedGrade && (
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <FormInput
            label="Enter Topic"
            name="topic"
            placeholder="e.g. Big Bang Theory"
            value={selectedTopic}
            onChange={(e) => setTopicInput(e.target.value)}
            register={register}
            required
          />
          <button
            type="button"
            onClick={() => handleTopicChange(topicInput)}
            className="px-4 py-2 rounded-3xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow transition"
          >
            Search Relevant Standards
          </button>
        </div>
      )}

      {/* Curriculum Data Preview (shown after a topic is searched) */}
      {selectedStandard && selectedSubject && selectedGrade && selectedTopic && curriculumData.length > 0 && (
        <FormDiv
          label="Curriculum Data"
          selectedPoints={selectedCurriculumPoint}
          fetchedContent={curriculumData}
          setEnlarge={setEnlargeCurriculumModal}
        />
      )}

      {/* Modal for selecting a specific curriculum point from the list */}
      {enlargeCurriculumModal && (
        <FormCurriculumPointSelectionModal
          enlarge={enlargeCurriculumModal}
          setEnlarge={setEnlargeCurriculumModal}
          fetchedContent={curriculumData}
          selectedCurriculumPoint={selectedCurriculumPoint}
          setSelectedCurriculumPoint={setSelectedCurriculumPoint}
          name="curriculumPoint"
          setValue={setValue}
        />
      )}
    </div>
  );
};

export default StandardForm;
