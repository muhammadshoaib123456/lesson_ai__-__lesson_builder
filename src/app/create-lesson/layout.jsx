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
  // Local UI states that App.jsx previously handled
  const [loading, setLoading] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const [genSlides, setGenSlides] = useState(false);
  const [queueStatus, setQueueStatus] = useState("");

  return (
    <Provider store={store}>
      <SocketBoundary />

      {/* Share loading & modal state across children */}
      <FinalModalContext.Provider value={{ setFinalModal }}>
        <GoogleAnalytics />
        <PopupProvider>
          <FormProvider>
            {/* Render children (pages) inside providers */}
            {children}
          </FormProvider>
        </PopupProvider>
      </FinalModalContext.Provider>

      {/* Global overlays */}
      {loading && <LoadingScreen status={queueStatus} />}
      {genSlides && <GenSlidesModal />}
      {finalModal && <FinalModal setFinalModal={setFinalModal} />}

      <ToastContainer />
    </Provider>
  );
}
