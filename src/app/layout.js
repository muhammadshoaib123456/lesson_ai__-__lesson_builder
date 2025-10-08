// // app/layout.jsx
// import "./globals.css";
// import Providers from "./providers";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <Providers>
//           {children}
//           <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
//         </Providers>
//       </body>
//     </html>
//   );
// }




"use client";

import "./globals.css";
import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "./create-lesson/feature/Redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SocketBoundary from "./create-lesson/feature/SocketBoundary";
import { FormProvider } from "./create-lesson/feature/Pages/MainPage/Components/standard/FormContext";
import { FinalModalContext } from "./create-lesson/feature/GlobalFuncs/FinalModalContext";
import GoogleAnalytics from "./create-lesson/feature/utils/ganalytics";
import { PopupProvider } from "./create-lesson/feature/Layout/Components/GuruPopUpContext";
import { LoadingScreen, FinalModal, GenSlidesModal } from "./create-lesson/feature/Loaders/index";
import Providers from "./providers";

export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const [genSlides, setGenSlides] = useState(false);
  const [queueStatus, setQueueStatus] = useState("");

  return (
    <html lang="en">
      <body>
        <Providers>
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

            <ToastContainer
              position="top-right"
              autoClose={3000}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Provider>
        </Providers>
      </body>
    </html>
  );
}

