"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormContext as useStdFormContext } from "./FormContext";
import { getData } from "./getFormData";
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
  const [isFetchingCurriculum, setIsFetchingCurriculum] = useState(false);

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

  /**
   * ✅ FIXED LOGIC:
   * The modal now waits until curriculum data has been fetched successfully,
   * then automatically opens (just like your working React example).
   */
  const handleSearchCurriculum = async () => {
    if (
      !standardModeEnabled ||
      !selectedStandard ||
      !selectedSubject ||
      !selectedGrade ||
      !topicInput
    ) {
      return;
    }

    setIsFetchingCurriculum(true);
    try {
      // trigger topic change for context consistency
      handleTopicChange(topicInput);

      // fetch curriculum data
      const data = await getData(
        "standards/curriculum",
        selectedGrade.value,
        selectedStandard.value,
        selectedSubject.value,
        topicInput
      );

      setCurriculumData(data || []);

      // ✅ Only open modal after data is successfully loaded
      if (data && Object.keys(data).length > 0) {
        setEnlargeCurriculumModal(true);
      } else {
        alert("No curriculum data found for this topic.");
      }
    } catch (error) {
      console.error("Error fetching curriculum data:", error);
      setCurriculumData([]);
    } finally {
      setIsFetchingCurriculum(false);
    }
  };

  // Close modal if user clears dependencies
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

      {/* Topic input + button */}
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
            onClick={handleSearchCurriculum}
            disabled={isFetchingCurriculum}
            className={`px-4 py-2 rounded-3xl ${
              isFetchingCurriculum
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold text-xs shadow transition`}
          >
            {isFetchingCurriculum ? "Loading..." : "Search Relevant Standards"}
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

      {/* Curriculum modal */}
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

      {/* Hidden field for form data */}
      <input type="hidden" {...register("curriculumPoint")} />
    </div>
  );
};

export default StandardForm;
