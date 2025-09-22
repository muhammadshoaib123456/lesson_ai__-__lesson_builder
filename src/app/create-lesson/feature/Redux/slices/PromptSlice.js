"use client";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reqPrompt: '',
  grade: '',
  slides: '',
  subject: '',
};

const PromptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    setForm: (state, action) => {
      const { reqPrompt, grade, slides, subject } = action.payload;
      return { ...state, reqPrompt, grade, slides, subject };
    },
  },
});

export const { setForm } = PromptSlice.actions;
export default PromptSlice.reducer;