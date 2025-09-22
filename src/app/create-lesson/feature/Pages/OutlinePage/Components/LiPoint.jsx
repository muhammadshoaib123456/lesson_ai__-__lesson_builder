"use client";

export default function LiPoint({
  point,
  pIndex,
  setDataJson,
  deletePoint,
  index,
  addPointAbove,
  cardBg = "#D6D5E6",
}) {
  function autoExpand(event) {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  return (
    // ↓ Reduce vertical gap between items (tweak py-* here)
    <li className="flex items-start w-full py-0.5">
      {/* Bullet dot */}
      <span className="text-purple-700 mr-2 mt-[6px]">•</span>

      {/* Text area (border hidden by default; shows on focus) */}
      <div className="w-full relative">
        <textarea
          onInput={autoExpand}
          defaultValue={point}
          onChange={(e) => {
            const val = e.target.value;
            setDataJson((prev) => {
              const next = prev.map((s) => ({ ...s, content: [...s.content] }));
              next[pIndex - 1].content[index] = val;
              return next;
            });
          }}
          className="flex-1 w-full resize-none overflow-hidden
                     bg-transparent text-sm sm:text-base text-gray-800 placeholder-gray-500
                     rounded-md border-2 transition
                     focus:outline-none focus:border-black focus:bg-white focus:text-black
                     py-1 px-2 pr-20"
          style={{
            borderColor: cardBg, // invisible at rest (same width avoids layout shift)
          }}
        />

        {/* Inline controls */}
        <div className="absolute top-1/2 -translate-y-1/2 right-1 flex items-center space-x-1">
          <button
            type="button"
            onClick={() => addPointAbove(index)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors"
            title="Insert bullet above"
          >
            <span className="text-lg leading-none text-blue-600">+</span>
          </button>
          <button
            type="button"
            onClick={() => deletePoint(index)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
            title="Delete bullet"
          >
            <span className="text-lg leading-none text-red-600">×</span>
          </button>
        </div>
      </div>
    </li>
  );
}
