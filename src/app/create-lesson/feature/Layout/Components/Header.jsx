"use client";

import { useSelector } from "react-redux";
import { FinalModalContext } from "../../GlobalFuncs/FinalModalContext.js";
import { useContext, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import desk_logo from "../assets/desk_logo.svg";
import mob_logo from "../assets/mob_logo.svg";
import help from "../assets/help.svg";
import DropDown from "./DropDown.jsx";
import SideMenu from "./SideMenu.jsx";
import PopupContext from "./GuruPopUpContext.jsx";

export default function Header() {
  const { setFinalModal } = useContext(FinalModalContext);
  const { loading, isAvailable } = useSelector((state) => state.download);
  const [isScreenMobile, setIsScreenMobile] = useState(false);
  const { showPopup, setShowPopup } = useContext(PopupContext);
  const router = useRouter();

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      setIsScreenMobile(window.innerWidth < 640);
      
      const handleResize = () => {
        setIsScreenMobile(window.innerWidth < 640);
      };

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Cleanup function to remove event listener
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <header className="min-w-full w-full justify-between flex flex-row h-14 lg:px-16 sm:px-12 lg:px-16 px-3 sm:pt-4 pt-2">
      <a
        className="flex justify-start items-center"
        href="http://lessn.ai/"
      >
        <Image
          src={desk_logo}
          alt="Logo"
          className="md:h-10 sm:h-8 hidden sm:block"
          width={520}
          height={520}
        />
        <Image
          src={mob_logo}
          alt="Logo"
          className="h-10 block sm:hidden"
          width={520}
          height={520}
        />
      </a>
      <div className="justify-end flex flex-row max-w-[80%] sm:min-w-[80%] lg:min-w-[65%]">
        {!isScreenMobile && (
          <div className="sm:min-w-[80%] lg:min-w-[70%] sm:pl-4 sm:mr-5 lg:mr-12 sm:visible min-w-[1%] flex items-center justify-end">
            <a
              href="https://www.lessn.ai/explorelibrary/"
              className="font-wide text-white hover:text-hover-grey mr-8"
            >
              Explore Library
            </a>
            <a className="font-wide text-gray-400 mr-4">Create a Lessn</a>
            <DropDown />
          </div>
        )}
        <div className="flex justify-end items-center mr-2">
          {isAvailable && (
            <button
              onClick={() => {
                setFinalModal(true);
              }}
              disabled={loading}
              className={
                loading
                  ? "rounded-full h-8 w-8 sm:h-8 sm:w-8 md:h-10 md:w-10 flex items-center justify-center bg-blue-primary no-animation"
                  : "rounded-full h-8 w-8 sm:h-8 sm:w-8 md:h-10 md:w-10 flex items-center justify-center bg-green-primary text-white border-0"
              }
            >
              {!loading && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  />
                </svg>
              )}
              {loading && (
                <span className="loading bg-white h-8 w-8 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              )}
            </button>
          )}
        </div>
        <div className="flex justify-end items-center">
          <button
            onClick={() => {
              setShowPopup((prev) => {
                return !prev;
              });
            }}
          >
            <Image
              src={help}
              alt="help"
              className="min-h-8 w-8 sm:h-8 sm:w-8 md:h-10 md:w-10 object-contain"
              width={40}
              height={40}
            />
          </button>
        </div>
        {isScreenMobile && (
          <div className="flex justify-end items-center ml-2">
            <SideMenu />
          </div>
        )}
      </div>
    </header>
  );
}