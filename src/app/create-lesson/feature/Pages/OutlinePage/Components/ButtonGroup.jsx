"use client";
import Link from "next/link";

/**
 * ButtonGroup
 *
 * Renders the three primary actions for the outline page: cancel, regenerate and
 * generate. Styling closely follows the provided UI spec with a plain text
 * cancel link, an outlined regenerate button and a filled generate button.
 */
export default function ButtonGroup({ genSlides, onRegenerate }) {
  return (
    // The container aligns the three buttons to the right and spaces them evenly.
    <div className="w-full flex justify-end space-x-4">
      {/* 
        Cancel button: plain text link. Adjust the padding (px-4/py-2) to change
        the clickable area. You can change the colour classes (text-purple-700)
        to alter the text colour and hover state. Removing px/py will make
        the link tighter.
      */}
      <Link
        href="/create-lesson"
        className="flex items-center px-4 py-2 text-purple-700 hover:text-purple-900 text-sm font-semibold"
      >
        Cancel
      </Link>
      {/* 
        Regenerate Slides button: uses an outline style with a purple border. To
        change the border or text colour, modify border-purple-600 and
        text-purple-600. The hover background (bg-purple-50) gives subtle
        feedback; change or remove it to suit your palette.
      */}
      <button
        type="button"
        onClick={onRegenerate}
        className="px-5 py-2 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-sm font-semibold transition-colors"
      >
        Regenerate Slides
      </button>
      {/* 
        Generate Slides button: filled with purple. Modify bg-purple-600 and
        hover:bg-purple-700 to change the colours. The text is white for
        contrast. Adjust px/py values to change the button size.
      */}
      <button
        type="button"
        onClick={genSlides}
        className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
      >
        Generate Slides
      </button>
    </div>
  );
}
