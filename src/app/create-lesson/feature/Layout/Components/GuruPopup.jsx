"use client";

import { useContext, useEffect } from "react";
import PopupContext from "./GuruPopUpContext";
import Image from "next/image";
import camera from "../assets/camera.svg";
import hp from "../assets/head_phone.svg";
import help from "../assets/help.svg";
import team from "../assets/team.png";
import cross from "../assets/cross.png";

const Popup = () => {
  const { showPopup, setShowPopup } = useContext(PopupContext);

  useEffect(() => {
    // Event handler to close the popup when clicking outside of the modal
    const handleClickOutside = (event) => {
      const modal = document.getElementById("popup_modal");
      if (modal && !modal.contains(event.target)) {
        setShowPopup(false); // Close the popup if clicked outside
      }
    };

    // Attach event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowPopup]);

  return (
    <div className="fixed w-full h-full md:bg-opacity-30 md:bg-gray-800 flex overflow-y-auto justify-center items-center">
      <div
        id="popup_modal"
        className="md:m-8 h-full w-full lg:w-[50vw] lg:h-[73vh] md:min-w-[700px] md:max-w-[800px] md:w-[75vw] md:h-[65vh] md:max-h-[530px] md:min-h-[350px] bg-white rounded-xl object-contain flex flex-col overflow-y-scroll lg:overflow-y-hidden"
      >
        <div className="px-6 py-4 bg-purple-popup rounded-t-xl flex flex-row justify-between text-center items-center">
          <p className="text-white text-[17px] font-bold">Our Support</p>
          <button
            onClick={() => {
              setShowPopup(false);
            }}
          >
            <Image src={cross} alt="cross" className="h-[18px] cursor-pointer" width={18} height={18} />
          </button>
        </div>
        <div className="flex-grow md:grid md:grid-cols-10 flex flex-col">
          <div className="md:col-span-4 rounded-bl-none md:rounded-bl-xl flex flex-col py-10">
            <a href="https://www.onescreensolutions.com/en/onescreen-live-demo-video-call">
              <span className="flex flex-row border-b-2 border-gray-200 mr-6 ml-2 py-1">
                <Image src={camera} alt="camera" className="mr-6 ml-4 h-[20px]" width={20} height={20} />
                <p className="font-serif font-normal text-gray-primary">
                  Video Conference
                </p>
              </span>
            </a>
            <a href="https://www.onescreensolutions.com/en/onescreen-live-demo-audio-call">
              <span className="flex flex-row border-b-2 border-gray-200 mt-4 mr-6 ml-2 py-1">
                <Image src={hp} alt="hp" className="mr-8 ml-4 h-[20px]" width={20} height={20} />
                <p className="font-serif font-normal text-gray-primary">
                  Audio Conference
                </p>
              </span>
            </a>
            <div className="flex-grow flex flex-col items-center text-center justify-between">
              <a href="https://www.onescreensolutions.com/en/theresaguruforthat">
                <Image src={help} alt="help" className="h-[125px] mt-2" width={125} height={125} />
              </a>
              <span>
                <p className="text-purple-popup font-bold text-[24px]">
                  Free, unlimited
                </p>
                <p className="text-purple-popup font-bold text-[24px]">
                  help & training
                </p>
              </span>
              <span>
                <p className="text-gray-secondary font-normal text-[18px]">
                  Now on desktop & mobile
                </p>
              </span>
            </div>
          </div>
          <div className="md:col-span-6 bg-gray-200 rounded-b-xl md:rounded-bl-none md:rounded-br-xl flex flex-col pt-10 px-6 pb-6">
            <span>
              <p className="text-purple-popup font-semibold text-[14px]">
                We can help now on video, audio or chat.
              </p>
              <p className="text-gray-primary font-normal text-[14px] mt-2">
                Our Guru team is available 24/5 with free, unlimited help and
                training.
              </p>
            </span>
            <Image src={team} alt="team" className="pt-4" />
            <span>
              <p className="text-gray-primary font-normal text-[13px] mt-6">
                Also available via email:
              </p>
              <p className="text-gray-primary font-normal text-[13px]">
                <b>support@onescreensolutions.com</b> or
              </p>
              <p className="text-gray-primary font-normal text-[13px]">
                phone: <b>(855) 898-8111</b>
              </p>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;