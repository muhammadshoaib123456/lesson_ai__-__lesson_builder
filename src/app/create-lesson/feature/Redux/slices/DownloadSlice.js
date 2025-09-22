"use client";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  isAvailable: false,
};

const DownloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      const loading = action.payload;
      return { ...state, loading };
    },
    setAvailability: (state, action) => {
      const isAvailable = action.payload;
      return { ...state, isAvailable };
    },
  },
});

export const { setLoading, setAvailability } = DownloadSlice.actions;
export default DownloadSlice.reducer;