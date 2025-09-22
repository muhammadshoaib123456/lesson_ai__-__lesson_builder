"use client";

import { useEffect, useContext } from "react";
import { useRouter } from 'next/navigation';
import Card from "./Components/Card.jsx";
import Footer from "./Components/Footer.jsx";
import Header from "./Components/Header.jsx";
import initializeSocketConnection, { disconnectSocket } from "../GlobalFuncs/SocketConn.js";
import { useDispatch, useSelector } from "react-redux";
import image from "./assets/img.png";
import PopupContext from "./Components/GuruPopUpContext.jsx";
import Popup from "./Components/GuruPopup.jsx";

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const socketID = useSelector((state) => state.socket.socketId);
  const { showPopup, setShowPopup } = useContext(PopupContext);

  useEffect(() => {
    // Initialize socket when component mounts
    initializeSocketConnection(dispatch);

    // Cleanup function - disconnect socket when leaving the page
    return () => {
      disconnectSocket(dispatch);
    };
  }, [dispatch]);

  // Listen for route changes and disconnect socket
  useEffect(() => {
    const handleRouteChange = () => {
      disconnectSocket(dispatch);
    };

    // Clean up on unmount or route change
    return () => {
      handleRouteChange();
    };
  }, [dispatch]);

  // Rest of your existing Layout code...
  if (socketID === null) {
    return (
      <div className="flex flex-col w-full h-full overflow-hidden">
        <Header />
        <main className={"w-full h-[calc(100vh-5.5rem)]"}>
          <Card>
            <section className="bg-white rounded-lg w-full h-full items-center justify-center">
              <div className="p-2 mx-auto max-w-screen-xl lg:p-3 flex flex-row w-full h-full">
                <div className={"h-full w-full px-4 flex justify-center items-center my-auto"}>
                  <img src={image} alt={"image"} />
                </div>
                <div className="mx-auto max-w-screen-sm text-center w-full h-full justify-center items-center flex flex-col self-center">
                  <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600">
                    508
                  </h1>
                  <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl">
                    Resource Limit Reached
                  </p>
                  <p className="mb-4 text-lg font-light text-gray-500">
                    The server is currently overloaded and cannot process your request.
                  </p>
                </div>
              </div>
            </section>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    socketID && (
      <div className="flex flex-col w-full h-full lg:overflow-hidden overflow-y-auto overflow-x-hidden relative">
        <Header />
        <main className={"lg:w-full lg:h-[calc(100vh-5.5rem)] flex-grow"}>
          <Card>
            {children}
          </Card>
        </main>
        <Footer />
        {showPopup && <Popup />}
      </div>
    )
  );
}