"use client";

import { Provider } from "react-redux";
import { store } from "./feature/Redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SocketBoundary from "./feature/SocketBoundary";
import "../globals.css";

export default function CreateLessonLayout({ children }) {
  return (
    <Provider store={store}>
      <SocketBoundary />
      {children}
      <ToastContainer />
    </Provider>
  );
}
