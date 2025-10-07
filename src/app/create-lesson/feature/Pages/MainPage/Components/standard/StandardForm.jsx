"use client";

/*
 * StandardForm.jsx
 *
 * Standards-mode multi-step form.  Lets the user pick a standard,
 * subject, grade, topic, and specific curriculum point.
 * Integrated with react-hook-form and shared FormContext.
 */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormContext as useStdFormContext } from "./FormContext";
import { getData } from "./getFormData";
// Import input and select components from the main components folder.  The
// standard‑components directory has been removed in favour of using
// shared components with behaviour flags.
import { FormInput } from "./standard-components/FormInput";
import { FormSelect } from "./standard-components/FormSelect";
import { FormCurriculumPointSelectionModal } from "./standard-components/FormCurriculumPointSelectionModal";
import { FormDiv } from "./standard-components/FormDiv";

const StandardForm = ({ register, setValue }) => {
  const standardModeEnabled = useSelector((state) => state.standard.standard);

  const {
    selectedStandard,
    selectedSubject,
    selectedGrade,
    selectedTopic,
    selectedCurriculumPoint,
    standardOptions,
    subjectOptions,
    gradeOptions,
    curriculumData,
    loadingStandards,
    loadingSubjects,
    loadingGrades,
    topicInput,
    setTopicInput,
    setCurriculumData,
    setStandardOptions,
    setSubjectOptions,
    setGradeOptions,
    setLoadingStandards,
    setLoadingSubjects,
    setLoadingGrades,
    handleStandardChange,
    handleSubjectChange,
    handleGradeChange,
    handleTopicChange,
    setSelectedCurriculumPoint,
  } = useStdFormContext();

  const [enlargeCurriculumModal, setEnlargeCurriculumModal] = useState(false);

  // Fetch standards
  useEffect(() => {
    if (!standardModeEnabled) return;
    const fetchStandardOptions = async () => {
      setLoadingStandards(true);
      try {
        const options = await getData("standards");
        setStandardOptions(options || []);
      } catch (error) {
        console.error("Error fetching standard options:", error);
        setStandardOptions([]);
      } finally {
        setLoadingStandards(false);
      }
    };
    fetchStandardOptions();
  }, [standardModeEnabled, setLoadingStandards, setStandardOptions]);

  // Fetch subjects
  useEffect(() => {
    if (!standardModeEnabled || !selectedStandard) return;
    const fetchSubjectOptions = async () => {
      setLoadingSubjects(true);
      try {
        const options = await getData(
          "standards/subjects",
          null,
          selectedStandard.value
        );
        setSubjectOptions(options || []);
      } catch (error) {
        console.error("Error fetching subject options:", error);
        setSubjectOptions([]);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjectOptions();
  }, [standardModeEnabled, selectedStandard, setLoadingSubjects, setSubjectOptions]);

  // Fetch grades
  useEffect(() => {
    if (!standardModeEnabled || !selectedStandard || !selectedSubject) return;
    const fetchGradeOptions = async () => {
      setLoadingGrades(true);
      try {
        const options = await getData(
          "standards/grades",
          null,
          selectedStandard.value,
          selectedSubject.value
        );
        setGradeOptions(options || []);
      } catch (error) {
        console.error("Error fetching grade options:", error);
        setGradeOptions([]);
      } finally {
        setLoadingGrades(false);
      }
    };
    fetchGradeOptions();
  }, [
    standardModeEnabled,
    selectedStandard,
    selectedSubject,
    setLoadingGrades,
    setGradeOptions,
  ]);

  // Fetch curriculum data when topic changes
  useEffect(() => {
    if (
      !standardModeEnabled ||
      !selectedStandard ||
      !selectedSubject ||
      !selectedGrade ||
      !selectedTopic
    )
      return;
    const fetchCurriculumData = async () => {
      try {
        const data = await getData(
          "standards/curriculum",
          selectedGrade.value,
          selectedStandard.value,
          selectedSubject.value,
          selectedTopic
        );
        setCurriculumData(data || []);
        // Do not automatically show the curriculum modal here.  The modal
        // will be triggered explicitly when the user clicks the search
        // button or the edit selection button.
      } catch (error) {
        console.error("Error fetching curriculum data:", error);
        setCurriculumData([]);
      }
    };
    fetchCurriculumData();
  }, [
    standardModeEnabled,
    selectedStandard,
    selectedSubject,
    selectedGrade,
    selectedTopic,
    setCurriculumData,
  ]);

  // Close the curriculum modal whenever any of the dependent selections
  // (standard, subject, grade, or topic) become empty.  Without this
  // effect, navigating back to the main page or clearing a field would
  // leave the modal open, resulting in a poor user experience.
  useEffect(() => {
    if (
      !standardModeEnabled ||
      !selectedStandard ||
      !selectedSubject ||
      !selectedGrade ||
      !selectedTopic
    ) {
      setEnlargeCurriculumModal(false);
    }
  }, [
    standardModeEnabled,
    selectedStandard,
    selectedSubject,
    selectedGrade,
    selectedTopic,
  ]);

  // No need to synchronise label fields or full curriculum point data in
  // this implementation.  The selected values are directly registered
  // via react-hook-form and the curriculum point array is written
  // through the modal's confirm handler.

  return (
    <div>
      {/* Standard selector */}
      <FormSelect
        label="Select Standard"
        name="standard"
        options={standardOptions}
        value={selectedStandard || null}
        onChange={handleStandardChange}
        register={register}
        loading={loadingStandards}
        placeholder="Select a standard..."
        required
        useLabelAsValue={true}
      />

      {/* Subject selector */}
      {selectedStandard && (
        <FormSelect
          label="Select Subject"
          name="subject"
          options={subjectOptions}
          value={selectedSubject || null}
          onChange={handleSubjectChange}
          register={register}
          loading={loadingSubjects}
          placeholder="Select a subject..."
          required
          useLabelAsValue={true}
        />
      )}

      {/* Grade selector */}
      {selectedStandard && selectedSubject && (
        <FormSelect
          label="Select Grade"
          name="grade"
          options={gradeOptions}
          value={selectedGrade || null}
          onChange={handleGradeChange}
          register={register}
          loading={loadingGrades}
          placeholder="Select a grade..."
          required
          useLabelAsValue={true}
        />
      )}

      {/* Topic input */}
      {selectedStandard && selectedSubject && selectedGrade && (
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <FormInput
            label="Enter Topic"
            name="topic"
            placeholder="e.g. Big Bang Theory"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            register={register}
            required
          />
          <button
            type="button"
            // When searching for relevant standards, trigger the topic change
            // handler and explicitly open the curriculum modal.  This ensures
            // the modal appears only in response to a deliberate user action.
            onClick={() => {
              handleTopicChange(topicInput);
              setEnlargeCurriculumModal(true);
            }}
            className="px-4 py-2 rounded-3xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow transition"
          >
            Search Relevant Standards
          </button>
        </div>
      )}

      {/* Curriculum preview */}
      {selectedStandard &&
        selectedSubject &&
        selectedGrade &&
        selectedTopic &&
        curriculumData && (
          <FormDiv
            label="Curriculum Data"
            selectedPoints={selectedCurriculumPoint}
            fetchedContent={curriculumData}
            setEnlarge={setEnlargeCurriculumModal}
          />
        )}

      {/* Curriculum selection modal */}
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

      {/* Hidden field for curriculum points.  This ensures the array of
          selected curriculum points is included in the form data. */}
      <input type="hidden" {...register("curriculumPoint")} />
    </div>
  );
};

export default StandardForm;