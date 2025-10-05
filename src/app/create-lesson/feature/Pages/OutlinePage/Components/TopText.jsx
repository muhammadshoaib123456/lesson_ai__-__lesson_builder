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
  // Access the prompt data from Redux.  gradeLabel and subjectLabel may be
  // empty strings when the original form is used.
  const Prompt = useSelector((state) => state.promptData);
  // Use the human‑readable labels when provided, otherwise fall back
  // to the raw values for grade and subject.
  const gradeDisplay = Prompt.gradeLabel || Prompt.grade;
  const subjectDisplay = Prompt.subjectLabel || Prompt.subject;
  // Determine the display name for the selected standard.  When
  // standards mode is enabled we store both the raw ID
  // (Prompt.chosenStandard) and the human‑readable title
  // (Prompt.standardLabel).  Use the title when available.
  const standardDisplay = Prompt.standardLabel || Prompt.chosenStandard;
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
        Topic <span className="font-bold text-white">"{Prompt.reqPrompt}"</span> for&nbsp;
        <span className="font-bold text-white">{gradeDisplay}</span>, subject&nbsp;
        <span className="font-bold text-white">{subjectDisplay}</span>&nbsp;
        and&nbsp;
        <span className="font-bold text-white">{Prompt.slides}</span> Slides.
      </p>
    </>
  );
}