"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  standard: false, // default value
};

const standardSlice = createSlice({
  name: "standard",
  initialState,
  reducers: {
    flip: (state) => {
      state.standard = !state.standard;
    },
    setStandard: (state, action) => {
      state.standard = action.payload;
    },
  },
});

export const { flip, setStandard } = standardSlice.actions;
export default standardSlice.reducer;
