"use client";

/*
 * StandardSlice.js
 *
 * Redux slice controlling whether the standards form is active.  A simple
 * boolean flag toggled via the `flip` reducer.  This slice is
 * intentionally trivial but kept separate for clarity.
 */

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  standard: false,
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