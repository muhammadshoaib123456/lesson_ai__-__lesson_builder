"use client";

/**
 * LiPoint
 *
 * Represents a single bullet point within a slide. Provides controls to insert
 * a new bullet below, delete the current bullet and drag to reorder. Styling
 * mimics the provided design with subtle colored circles for the control icons.
 */
export default function LiPoint({
  point,
  pIndex,
  setDataJson,
  deletePoint,
  index,
  addPointBelow,
  cardBg = "#FFFFFF",
  setDragOverIndex,
  handleDrop,
}) {
  function autoExpand(event) {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  return (
    <div
      className="flex items-start w-full py-1"
      // Make the entire bullet draggable. The drag-and-drop handlers allow
      // reordering bullets within a slide.
      draggable="true"
      onDragStart={(e) => e.dataTransfer.setData("text/plain", index.toString())}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOverIndex(index);
      }}
      onDrop={handleDrop}
    >
      {
        /* 
          Leading bullet icon. Adjust text-purple-700 to change the bullet
          colour. Increase mr-2 to add more spacing between the bullet and the
          textarea. The mt-2 roughly centers the dot vertically relative to
          the input line.
        */
      }
      <span className="text-purple-700 mr-2 mt-2 select-none">•</span>
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
          className="flex-1 w-full resize-none overflow-hidden bg-transparent text-sm sm:text-base text-gray-800 placeholder-gray-500 rounded-md border-0 focus:outline-none focus:border-black focus:bg-white focus:text-black py-1 px-2 pr-24"
          // The textarea inherits the card background. Remove bg-transparent if you
          // want a coloured input field. pr-24 reserves space on the right for
          // the action icons.
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center space-x-2"
          // This container holds the plus, reorder and delete icons. Adjust right-0
          // to add or remove spacing on the right edge of the card. space-x-1
          // controls the gap between icons.
        >
          {/* Insert new bullet below */}
          <button
            type="button"
            onClick={() => addPointBelow(index)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
            title="Insert bullet below"
            // The plus button shares the purple palette. Change the bg-* and
            // text-purple-* classes to adjust its appearance.
          >
            <span className="text-purple-600 text-lg leading-none">+</span>
          </button>
          {/* Reorder bullet */}
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 cursor-move transition-colors"
            title="Reorder bullet"
            // The reorder button uses an SVG icon. The cursor-move indicates
            // draggable behaviour. Modify the colours or size via the classes.
          >
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 5h16v2H4zM4 11h16v2H4zM4 17h16v2H4z" />
            </svg>
          </button>
          {/* Delete bullet */}
          <button
            type="button"
            onClick={() => deletePoint(index)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 transition-colors"
            title="Delete bullet"
            // Delete button uses a red palette. Adjust bg-red-* and text-red-* to
            // change its colour. Increase size via w-*/h-* utilities.
          >
            <span className="text-red-500 text-lg leading-none">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}
