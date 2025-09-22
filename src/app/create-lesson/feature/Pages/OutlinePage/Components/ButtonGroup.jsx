"use client";

import Link from "next/link";

export default function ButtonGroup({ genSlides }) {
  return (
    <div className="w-full flex justify-end space-x-4">
      <button
        type="button"
        onClick={genSlides}
        /*
          Primary action: green button styled to match the design. Uses a subtle
          hover darkening and rounded pill shape. Text is uppercase and
          medium weight.
        */
        className="px-8 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white uppercase text-sm font-semibold shadow-md transition-colors"
      >
        Generate Slides
      </button>
      <Link
        href="/create-lesson"
        /*
          Secondary action: neutral gray button. Slight hover darkening and
          rounded pill shape for consistency with the primary button.
        */
        className="px-8 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 uppercase text-sm font-semibold shadow-md transition-colors"
      >
        Cancel
      </Link>
    </div>
  );
}
