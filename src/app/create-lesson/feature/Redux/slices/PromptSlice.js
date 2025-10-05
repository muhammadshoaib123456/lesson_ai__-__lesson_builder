"use client";

/*
 * PromptSlice.js
 *
 * Redux slice for storing the form data used when generating lesson
 * outlines and slides.  This implementation mirrors the working React
 * version: it stores the user's lesson request under the `topic` key
 * (rather than `reqPrompt`) and omits the label fields (`gradeLabel`,
 * `subjectLabel`, `standardLabel`) that were previously used purely for
 * display purposes.  The `curriculumPoint` field is an array to
 * accommodate multiple selected curriculum points.
 */

import { createSlice } from "@reduxjs/toolkit";

// Define the shape of the prompt state.  All values default to empty
// strings or an empty array for curriculumPoint.  This avoids
// undefined checks downstream and keeps conditional logic simple.
const initialState = {
  topic: "",
  grade: "",
  slides: "",
  subject: "",
  chosenStandard: "",
  comments: "",
  // curriculumPoint holds an array of selected curriculum point objects.
  curriculumPoint: [],
};

const PromptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    setForm: (state, action) => {
      const {
        topic,
        grade,
        slides,
        subject,
        chosenStandard,
        comments,
        curriculumPoint,
      } = action.payload || {};

      // Return a new state with provided values, falling back to
      // defaults where undefined.  The spread ensures that any
      // additional properties on the state (should they be added in the
      // future) are preserved.
      return {
        ...state,
        topic: topic ?? "",
        grade: grade ?? "",
        slides: slides ?? "",
        subject: subject ?? "",
        chosenStandard: chosenStandard ?? "",
        comments: comments ?? "",
        curriculumPoint: curriculumPoint ?? [],
      };
    },
  },
});

export const { setForm } = PromptSlice.actions;
export default PromptSlice.reducer;