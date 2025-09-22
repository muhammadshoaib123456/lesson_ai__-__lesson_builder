"use client";

import { useState, useEffect } from "react";
import { LoadingScreen, FinalModal, GenSlidesModal } from "./Loaders";
import Layout from "./Layout";
import MainPage from "./Pages/MainPage/index.jsx";
import OutlinePage from "./Pages/OutlinePage/index.jsx";
import SlidesPreview from "./Pages/SlidesPreview/index.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FinalModalContext } from "./GlobalFuncs/FinalModalContext";
import GoogleAnalytics from "./utils/ganalytics";
import { PopupProvider } from "./Layout/Components/GuruPopUpContext.jsx";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { useRouter, usePathname } from "next/navigation";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const [genSlides, setGenSlides] = useState(false);
  const [queueStatus, setQueueStatus] = useState("");
  
  const router = useRouter();
  const pathname = usePathname();

  // Route component mapping for Next.js
  const getCurrentPage = () => {
    switch (pathname) {
      case '/create-lesson':
        return (
          <MainPage
            setLoading={setLoading}
            setGenSlides={setGenSlides}
            setFinalModal={setFinalModal}
          />
        );
      case '/create-lesson/outline':
        return (
          <OutlinePage
            setLoading={setLoading}
            setGenSlides={setGenSlides}
            setFinalModal={setFinalModal}
            setQueueStatus={setQueueStatus}
          />
        );
      case '/create-lesson/preview':
        return <SlidesPreview setFinalModal={setFinalModal} />;
      default:
        return (
          <MainPage
            setLoading={setLoading}
            setGenSlides={setGenSlides}
            setFinalModal={setFinalModal}
          />
        );
    }
  };

  return (
    <Provider store={store}>
      {loading && <LoadingScreen status={queueStatus} />}
      {genSlides && <GenSlidesModal />}
      {finalModal && <FinalModal setFinalModal={setFinalModal} />}
      
      <FinalModalContext.Provider value={{ setFinalModal }}>
        <GoogleAnalytics />
        <PopupProvider>
          <Layout>
            {getCurrentPage()}
          </Layout>
        </PopupProvider>
      </FinalModalContext.Provider>
      
      <ToastContainer />
    </Provider>
  );
}