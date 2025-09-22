"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useUsageLimit } from "../hooks/useUsageLimit";

export function LoadingScreen({ status }) {
  return (
     <div className="flex flex-col justify-center items-center h-screen fixed inset-0 z-[9999] backdrop-blur">
      <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-green-primary z-40" />
      <h1 className="text-2xl font-bold text-white mt-5 z-40">{status}</h1>
      <div className="absolute inset-0 bg-black opacity-50 z-10" />
    </div>
  );
}

export function FinalModal({ setFinalModal }) {
  const socketId = useSelector((state) => state.socket.socketId);
  const userText = useSelector((state) => state.promptData.reqPrompt);
  const [loading2, setLoading2] = useState(false);
  const { incrementUsage } = useUsageLimit();

  function downloadSlides() {
    setLoading2(true);
    
    // Call Next.js API route instead of direct Flask API
    // Use the lesson‑builder endpoint which proxies to the Flask server. The
    // previous code pointed at a non‑existent `lessn-builder` API and would
    // always return 404.
    fetch(`/api/lesson-builder/download-slides?socketID=${socketId}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        document.body.appendChild(link);
        link.href = url;
        link.download = `${userText}.pptx`;
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setLoading2(false);
        
        // Increment usage count after successful download
        incrementUsage();
      })
      .catch((error) => {
        console.log("Error", error);
        setLoading2(false);
      });
  }

  return (
    <div
      className="flex flex-col justify-center items-center fixed inset-0 z-[9999] backdrop-blur"
      onClick={(event) => {
        if (event.target.classList.contains('modals-backdrop')) {
          setFinalModal(false);
        }
      }}
    >
      <div className="relative z-20 max-w-lg w-[90%] sm:w-[75%] md:w-[60%] bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center">
        {/* Success icon and message */}
        <svg
          className="w-16 h-16 sm:w-20 sm:h-20 mb-4"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M160.5 80C160.5 124.183 124.683 160 80.5 160C36.3171 160 0.5 124.183 0.5 80C0.5 35.8171 36.3171 0 80.5 0C124.683 0 160.5 35.8171 160.5 80ZM71.2464 122.359L130.601 63.0045C132.617 60.989 132.617 57.721 130.601 55.7055L123.302 48.4064C121.287 46.3906 118.019 46.3906 116.003 48.4064L67.5968 96.8123L44.9971 74.2126C42.9816 72.1971 39.7135 72.1971 37.6977 74.2126L30.3987 81.5116C28.3832 83.5271 28.3832 86.7952 30.3987 88.8106L63.9471 122.359C65.9629 124.375 69.2306 124.375 71.2464 122.359Z"
            fill="#7DC243"
          />
        </svg>
        <h2 className="text-green-primary text-center text-lg sm:text-xl font-semibold mb-6">
          Presentation Completed Successfully
        </h2>
        {/* Buttons row */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {loading2 ? (
            <button
              disabled
              onClick={downloadSlides}
              className="flex items-center justify-center px-4 py-2 border-2 border-orange-600 bg-orange-100 rounded-lg text-orange-700 cursor-not-allowed"
            >
              <span className="animate-spin border border-orange-600 border-t-transparent rounded-full w-4 h-4 mr-2"></span>
              <PowerPointSVG />
              <span className="ml-2 text-sm">Download Slides</span>
            </button>
          ) : (
            <button
              onClick={downloadSlides}
              className="flex items-center justify-center px-4 py-2 border-2 border-orange-600 bg-orange-100 rounded-lg text-orange-700 hover:bg-orange-200 transition-colors"
            >
              <PowerPointSVG />
              <span className="ml-2 text-sm">Download Slides</span>
            </button>
          )}
          <a
            href={typeof window !== 'undefined' ? localStorage.getItem('url') || '#' : '#'}
            target="_blank"
            className="flex items-center justify-center px-4 py-2 border-2 border-gray-400 bg-gray-500 rounded-lg text-white hover:bg-gray-600 transition-colors"
          >
            <GoogleSlidesSVG />
            <span className="ml-2 text-sm">Upload Slides</span>
          </a>
        </div>
        {/* Close/back button */}
        <a
          href="/"
          className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-primary hover:bg-green-600 flex items-center justify-center"
        >
          <svg
            fill="#000000"
            className="w-5 h-5"
            viewBox="0 0 489.533 489.533"
            aria-hidden
          >
            <path d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9 l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6 c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6 C49.575,418.961,150.875,501.261,268.175,488.161z" />
          </svg>
        </a>
      </div>
      {/* Backdrop behind modal */}
      <div className="absolute inset-0 bg-black opacity-50 z-10 modals-backdrop"></div>
    </div>
  );
}

export function GoogleSlidesSVG() {
  return (
    <svg
      width="35"
      height="35"
      className={"p-1"}
      viewBox="0 0 49 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.456 2C9.79914 2 8.45599 3.34315 8.45599 5V43C8.45599 44.6569 9.79914 46 11.456 46H37.456C39.1128 46 40.456 44.6569 40.456 43V14L28.456 2H11.456Z"
        fill="#F4B70A"
      />
      <path
        d="M11.456 46C9.79914 46 8.45599 44.6569 8.45599 43V42.5C8.45599 44.1569 9.79914 45.5 11.456 45.5H37.456C39.1128 45.5 40.456 44.1569 40.456 42.5V43C40.456 44.6569 39.1128 46 37.456 46H11.456Z"
        fill="#EFA904"
      />
      <path
        d="M11.456 2C9.79914 2 8.45599 3.34315 8.45599 5V5.5C8.45599 3.84315 9.79914 2.5 11.456 2.5H28.956L28.456 2H11.456Z"
        fill="#F6C028"
      />
      <path
        d="M40.456 24.25V14L38.706 12.25H30.2666C29.5985 12.25 29.2638 13.0579 29.7363 13.5303L40.456 24.25Z"
        fill="url(#paint0_linear_33_434)"
      />
      <path
        d="M28.456 2L40.456 14H31.456C29.7991 14 28.456 12.6569 28.456 11V2Z"
        fill="#FADC87"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.456 22C16.9037 22 16.456 22.4477 16.456 23V37C16.456 37.5523 16.9037 38 17.456 38H31.456C32.0083 38 32.456 37.5523 32.456 37V23C32.456 22.4477 32.0083 22 31.456 22H17.456ZM30.456 26.5H18.456V33.5H30.456V26.5Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_33_434"
          x1="34.9856"
          y1="24.25"
          x2="34.9856"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F4B70A" />
          <stop offset="1" stopColor="#E2930A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PowerPointSVG() {
  return (
    <svg
      width="35"
      className={""}
      height="35"
      viewBox="0 0 34 34"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="a"
          x1="4.494"
          y1="-1748.086"
          x2="13.832"
          y2="-1731.914"
          gradientTransform="translate(0 1756)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ca4c28" />
          <stop offset="0.5" stopColor="#c5401e" />
          <stop offset="1" stopColor="#b62f14" />
        </linearGradient>
      </defs>
      <title>file_type_powerpoint</title>
      <path
        d="M18.93,17.3,16.977,3h-.146A12.9,12.9,0,0,0,3.953,15.854V16Z"
        style={{ fill: "#ed6c47" }}
      />
      <path
        d="M17.123,3h-.146V16l6.511,2.6L30,16v-.146A12.9,12.9,0,0,0,17.123,3Z"
        style={{ fill: "#ff8f6b" }}
      />
      <path
        d="M30,16v.143A12.905,12.905,0,0,1,17.12,29h-.287A12.907,12.907,0,0,1,3.953,16.143V16Z"
        style={{ fill: "#d35230" }}
      />
      <path
        d="M17.628,9.389V23.26a1.2,1.2,0,0,1-.742,1.1,1.16,1.16,0,0,1-.45.091H7.027c-.182-.208-.358-.429-.521-.65a12.735,12.735,0,0,1-2.553-7.657v-.286A12.705,12.705,0,0,1,6.05,8.85c.143-.221.293-.442.456-.65h9.93A1.2,1.2,0,0,1,17.628,9.389Z"
        style={{ opacity: "0.10000000149011612", isolation: "isolate" }}
      />
      <path
        d="M16.977,10.04V23.911a1.15,1.15,0,0,1-.091.448,1.2,1.2,0,0,1-1.1.741H7.62q-.309-.314-.593-.65c-.182-.208-.358-.429-.521-.65a12.735,12.735,0,0,1-2.553-7.657v-.286A12.705,12.705,0,0,1,6.05,8.85h9.735A1.2,1.2,0,0,1,16.977,10.04Z"
        style={{ opacity: "0.20000000298023224", isolation: "isolate" }}
      />
      <path
        d="M16.977,10.04V22.611A1.2,1.2,0,0,1,15.785,23.8H6.506a12.735,12.735,0,0,1-2.553-7.657v-.286A12.705,12.705,0,0,1,6.05,8.85h9.735A1.2,1.2,0,0,1,16.977,10.04Z"
        style={{ opacity: "0.20000000298023224", isolation: "isolate" }}
      />
      <path
        d="M16.326,10.04V22.611A1.2,1.2,0,0,1,15.134,23.8H6.506a12.735,12.735,0,0,1-2.553-7.657v-.286A12.705,12.705,0,0,1,6.05,8.85h9.084A1.2,1.2,0,0,1,16.326,10.04Z"
        style={{ opacity: "0.20000000298023224", isolation: "isolate" }}
      />
      <path
        d="M3.194,8.85H15.132a1.193,1.193,0,0,1,1.194,1.191V21.959a1.193,1.193,0,0,1-1.194,1.191H3.194A1.192,1.192,0,0,1,2,21.959V10.041A1.192,1.192,0,0,1,3.194,8.85Z"
        style={{ fill: "url(#a)" }}
      />
      <path
        d="M9.293,12.028a3.287,3.287,0,0,1,2.174.636,2.27,2.27,0,0,1,.756,1.841,2.555,2.555,0,0,1-.373,1.376,2.49,2.49,0,0,1-1.059.935A3.607,3.607,0,0,1,9.2,17.15H7.687v2.8H6.141V12.028ZM7.686,15.94H9.017a1.735,1.735,0,0,0,1.177-.351,1.3,1.3,0,0,0,.4-1.025q0-1.309-1.525-1.31H7.686V15.94Z"
        style={{ fill: "#fff" }}
      />
    </svg>
  );
}

export function GenSlidesModal() {
  const loadingText = [
    "Validating input...",
    "Scanning for errors...",
    "Processing data...",
    "Establishing connection...",
    "Sending request...",
    "Fetching data...",
    "Communicating with server...",
    "Checking status...",
    "Waiting for server...",
    "Loading content...",
    "Retrieving information...",
    "Analyzing data...",
    "Preparing response...",
    "Parsing response...",
  ];
  const [text, setText] = useState(loadingText[0]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadingText.indexOf(text) === loadingText.length - 1
        ? setText(loadingText[0])
        : setText(loadingText[loadingText.indexOf(text) + 1]);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [text, loadingText]);

  return (
    <div className="flex flex-col justify-center items-center h-screen absolute w-full z-[9999] backdrop-blur">
      <div className="flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-green-primary z-40"></div>
        <h1 className="text-2xl font-bold text-white mt-5 z-40">{text}</h1>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>
    </div>
  );
}