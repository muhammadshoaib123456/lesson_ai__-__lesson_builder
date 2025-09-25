"use client";
import { useSelector } from "react-redux";

/**
 * TopText
 *
 * This component renders the subheading under the “Outline Preview” label.
 * It uses data from the Redux store (promptData) to populate the topic,
 * grade, subject and slide count. The default styling uses white text
 * so it can be placed on a purple gradient background. Adjust text colours
 * or font weights here if you change your colour palette.
 */
export default function TopText() {
  const Prompt = useSelector((state) => state.promptData);
  return (
    // The wrapper fragment allows you to return multiple elements without
    // adding an extra DOM node. We only render the descriptive subheading here.
    <>
      <p
        // This paragraph describes the topic, grade, subject and slide count.
        // The default text colour is semi-transparent white so it contrasts well
        // against a purple gradient background. You can tweak the opacity or
        // colour here to suit your own palette.
        className="text-center text-white/90 my-2 text-xs sm:text-sm md:text-base leading-relaxed"
      >
        Outline for the Topic{" "}
        <span className="font-bold text-white">
          "{Prompt.reqPrompt}"
        </span>{" "}
        for&nbsp;
        <span className="font-bold text-white">{Prompt.grade}</span>, subject{" "}
        <span className="font-bold text-white">{Prompt.subject}</span>&nbsp;
        and&nbsp;
        <span className="font-bold text-white">{Prompt.slides}</span> Slides.
      </p>
    </>
  );
}
