"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  socketId: "",
  receivedData: [],
  imageData: [],
};

const SocketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocketId: (state, action) => {
      const socketId = action.payload ?? "";
      return { ...state, socketId };
    },
    setReceivedData: (state, action) => {
      const data = action.payload;
      const receivedData = [...state.receivedData];
      const idx = Math.max(0, (data?.slide ?? 1) - 1);
      receivedData[idx] = data;
      return { ...state, receivedData };
    },
    setDefaultReceivedData: (state, action) => {
      return { ...state, receivedData: [...(action.payload ?? [])] };
    },
    resetReceivedData: (state) => {
      return { ...state, receivedData: [] };
    },
    setDefaultImageData: (state, action) => {
      return { ...state, imageData: [...(action.payload ?? [])] };
    },
    setImageData: (state, action) => {
      const data = action.payload;
      const imageData = [...state.imageData];
      const idx = Math.max(0, (data?.slide_number ?? 1) - 1);
      imageData[idx] = data;
      return { ...state, imageData };
    },
    resetImageData: (state) => {
      return { ...state, imageData: [] };
    },
    filterEmptyData: (state) => {
      const filteredData = state.receivedData.filter((d) => {
        if (!d) return false;
        const titleOk = typeof d.title === "string" && d.title.trim() !== "";
        const contentArr = Array.isArray(d.content) ? d.content : [];
        const hasNonEmptyContent = contentArr.some(
          (t) => (t ?? "").toString().trim() !== ""
        );
        return titleOk && hasNonEmptyContent;
      });
      return { ...state, receivedData: filteredData };
    },
  },
});

export const {
  setSocketId,
  setReceivedData,
  resetReceivedData,
  setImageData,
  resetImageData,
  setDefaultReceivedData,
  setDefaultImageData,
  filterEmptyData,
} = SocketSlice.actions;

export default SocketSlice.reducer;
