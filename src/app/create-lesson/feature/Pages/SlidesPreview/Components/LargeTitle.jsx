"use client";

import { useSelector } from "react-redux";

export default function LargeTitle() {
  // Use `topic` as the lesson prompt instead of `reqPrompt`.  The prompt slice
  // has been updated to store the user's request under this key.
  const { topic } = useSelector((state) => state.promptData);
  const formattedPrompt = (topic || "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    // no outer white/rounded/shadow card here
    <div className="h-full w-full aspect-[16/9] flex flex-col">
      <div className="h-[4%] w-full bg-[#7d00a8]"></div>
      <h1 className="h-[96%] flex items-center justify-center text-center xl:text-[300%] lg:text-[250%] sm:text-[200%] text-2xl px-[10%] py-[1%]">
        <b>{formattedPrompt}</b>
      </h1>
    </div>
  );
}
