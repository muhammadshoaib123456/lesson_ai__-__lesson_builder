"use client";

/*
 * PromptSlice.js
 *
 * Redux slice for storing the form data used when generating lesson
 * outlines.  It persists both the raw values (grade, subject, etc.) and
 * the human‑readable labels selected in standards mode.  Absent values
 * are normalised to empty strings to simplify conditional rendering.
 */

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reqPrompt: "",
  grade: "",
  slides: "",
  subject: "",
  chosenStandard: "",
  comments: "",
  curriculumPoint: "",
  gradeLabel: "",
  subjectLabel: "",
  standardLabel: "",
};

const PromptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    setForm: (state, action) => {
      const {
        reqPrompt,
        grade,
        slides,
        subject,
        chosenStandard,
        comments,
        curriculumPoint,
        gradeLabel,
        subjectLabel,
        standardLabel,
      } = action.payload;
      return {
        ...state,
        reqPrompt,
        grade,
        slides,
        subject,
        chosenStandard: chosenStandard ?? "",
        comments: comments ?? "",
        curriculumPoint: curriculumPoint ?? "",
        gradeLabel: gradeLabel ?? state.gradeLabel,
        subjectLabel: subjectLabel ?? state.subjectLabel,
        standardLabel: standardLabel ?? state.standardLabel,
      };
    },
  },
});

export const { setForm } = PromptSlice.actions;
export default PromptSlice.reducer;