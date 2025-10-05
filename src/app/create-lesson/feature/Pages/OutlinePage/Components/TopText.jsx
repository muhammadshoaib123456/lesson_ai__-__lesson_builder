"use client";

/*
 * TopText.jsx
 *
 * Displays the subtitle for the outline preview.  It shows the
 * selected standard (when standards mode is enabled), the topic,
 * grade and subject labels, and the number of slides.  The component
 * pulls its data directly from Redux via useSelector.
 */

import { useSelector } from "react-redux";

export default function TopText() {
  // Determine if standards mode is on
  const standardModeEnabled = useSelector((state) => state.standard.standard);
  // Access the prompt data from Redux.  Our revised slice stores the
  // human‑readable grade and subject directly and uses `topic` instead of
  // `reqPrompt`.  If your store combines the slice under a different key
  // (e.g. promptData vs prompt) adjust the selector accordingly.
  const prompt = useSelector((state) => state.prompt || state.promptData);
  // Derive display values directly from the prompt state.  The
  // `chosenStandard` holds the readable standard title when standards
  // mode is enabled.  Grade and subject fields already contain the
  // readable labels from the form.
  const gradeDisplay = prompt?.grade || "";
  const subjectDisplay = prompt?.subject || "";
  const standardDisplay = prompt?.chosenStandard || "";
  const slidesDisplay = prompt?.slides || "";
  const topic = prompt?.topic || "";
  return (
    <>
      <p className="text-center text-white/90 my-2 text-xs sm:text-sm md:text-base leading-relaxed">
        Outline for the{" "}
        {standardModeEnabled && standardDisplay && (
          <>
            <span>Standard </span>
            <span className="font-bold text-white">{standardDisplay}</span>
            <span>. </span>
          </>
        )}
        Topic <span className="font-bold text-white">"{topic}"</span> for&nbsp;
        <span className="font-bold text-white">{gradeDisplay}</span>, subject&nbsp;
        <span className="font-bold text-white">{subjectDisplay}</span>&nbsp;
        and&nbsp;
        <span className="font-bold text-white">{slidesDisplay}</span> Slides.
      </p>
    </>
  );
}