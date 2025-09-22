"use client";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  outline: [],
};

const OutlineSlice = createSlice({
  name: 'outline',
  initialState,
  reducers: {
    setOutline: (state, action) => {
      const outline = action.payload;
      return { ...state, outline };
    },
    resetOutline: (state) => {
      return { ...state, outline: [] };
    }
  },
});

export const { setOutline, resetOutline } = OutlineSlice.actions;
export default OutlineSlice.reducer;