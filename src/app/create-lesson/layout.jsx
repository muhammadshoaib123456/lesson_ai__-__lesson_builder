"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "./feature/Redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SocketBoundary from "./feature/SocketBoundary";
import { FormProvider } from "./feature/Pages/MainPage/Components/standard/FormContext";
import { FinalModalContext } from "./feature/GlobalFuncs/FinalModalContext";
import GoogleAnalytics from "./feature/utils/ganalytics";
import { PopupProvider } from "./feature/Layout/Components/GuruPopUpContext.jsx";
import { LoadingScreen, FinalModal, GenSlidesModal } from "./feature/Loaders/index";
import "../globals.css";

export default function CreateLessonLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const [genSlides, setGenSlides] = useState(false);
  const [queueStatus, setQueueStatus] = useState("");

  return (
    <Provider store={store}>
      <SocketBoundary />
      <FinalModalContext.Provider value={{ setFinalModal }}>
        <GoogleAnalytics />
        <PopupProvider>
          {/* ✅ One global FormProvider for the whole flow */}
          <FormProvider>
            {children}
          </FormProvider>
        </PopupProvider>
      </FinalModalContext.Provider>

      {loading && <LoadingScreen status={queueStatus} />}
      {genSlides && <GenSlidesModal />}
      {finalModal && <FinalModal setFinalModal={setFinalModal} />}
      <ToastContainer />
    </Provider>
  );
}
