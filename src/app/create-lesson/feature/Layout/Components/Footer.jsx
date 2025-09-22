"use client";

import Image from "next/image";
import f from "../assets/F.svg";
import i from "../assets/I.svg";
import x from "../assets/X.svg";
import os from "../assets/OneScreen.svg";

export default function Footer() {
  return (
    <footer className="h-auto sm:min-h-9 sm:max-h-10 grid grid-rows-3 sm:grid-cols-8 sm:justify-top sm:items-top sm:px-12 lg-px-16 sm:-mt-4 sm:pb-16 pb-1 px-3">
      <div className="text-md sm:text-lg text-white grid grid-rows-2 gap-0 sm:gap-5 sm:col-span-2 row-start-1">
        <span className="font-wide text-xs md:text-sm sm:text-xs sm:row-start-1 font-light sm:ml-1 lg:ml-4 2xl:ml-7">
          Brought to you by
        </span>
        <a
          href="https://www.onescreensolutions.com"
          className="sm:row-start-2 sm:mb-0 mb-1"
        >
          <Image
            src={os}
            alt="OneScreen"
            height={520}
            className="cursor-pointer mt-1 sm:ml-1 lg:ml-4 2xl:ml-7"
          />
        </a>
      </div>
      <span className="text-sm row-start-2 sm:col-start-3 sm:col-span-3 font-wide md:text-sm sm:text-sm font-light text-white cursor-pointer sm:mt-0 mt-3">
        <a href="https://www.lessn.ai/privacy-policy/">Privacy policy </a> |{" "}
        <a href="https://www.lessn.ai/terms/">Terms of service </a>
      </span>
      <div className="w-full sm:col-start-7 sm:col-span-2 row-start-3">
        <span className="font-bold flex flex-row sm:justify-end sm:items-end justify-start items-start">
          <a href="https://www.facebook.com/onescreenglobal/">
            <Image
              src={f}
              alt="Facebook"
              className="h-7 mr-6 cursor-pointer"
              height={520}
              width={520}
            />
          </a>
          <a href="https://x.com/onescreenglobal">
            <Image
              src={x}
              alt="X"
              className="h-7 mr-6 cursor-pointer"
              height={520}
              width={520}
            />
          </a>
          <a href="https://instagram.com/onescreenus">
            <Image
              src={i}
              alt="Instagram"
              className="h-7 sm:mr-1 lg:mr-4 2xl:mr-7 cursor-pointer"
              height={520}
              width={520}
            />
          </a>
        </span>
      </div>
    </footer>
  );
}