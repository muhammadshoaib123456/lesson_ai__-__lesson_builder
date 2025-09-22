"use client";

import { configureStore } from '@reduxjs/toolkit';
import PromptReducer from "../slices/PromptSlice.js";
import SocketReducer from "../slices/SocketSlice.js";
import OutlineReducer from "../slices/OutlineSlice.js";
import DownloadSlice from '../slices/DownloadSlice.js';

export const store = configureStore({
  reducer: {
    promptData: PromptReducer,
    socket: SocketReducer,
    outline: OutlineReducer,
    download: DownloadSlice,
  },
});