"use client";

import { useSelector } from "react-redux";

export default function TopText() {
  const Prompt = useSelector((state) => state.promptData);
  return (
    <>
      <h1 className="text-center font-bold md:text-3xl text-2xl">
        Outline Preview
      </h1>
      <p className="text-center text-gray-500 my-2 text-sm sm:text-md">
        Outline for the Topic{" "}
        <span className="font-black text-black">"{Prompt.reqPrompt}"</span>{" "}
        for&nbsp;
        <span className="font-black text-black">{Prompt.grade}</span>, subject{" "}
        <span className="font-black text-black">{Prompt.subject}</span>&nbsp;
        and&nbsp;
        <span className="font-black text-black">{Prompt.slides}</span> Slides.
      </p>
    </>
  );
}
