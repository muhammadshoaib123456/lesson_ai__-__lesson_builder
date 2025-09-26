"use client";
import LiPoint from "./LiPoint.jsx";
import { useCallback, useState } from "react";

/**
 * SlideComponent
 *
 * Represents a single slide in the outline. Contains a title field, a list
 * of bullet points and controls to delete the slide or add a new slide below.
 * Styling follows the provided spec: white card with rounded corners and
 * subtle border and shadow. Each bullet point is handled by the LiPoint
 * component above.
 */
export default function SlideComponent({
  points,
  setDataJson,
  index,
  title,
  DeleteSlide,
  addSlideBelow,
}) {
  const [dragOverIndex, setDragOverIndex] = useState(-1);

  const AddPointBelow = useCallback(
    (cIndex) => {
      setDataJson((prev) => {
        const next = prev.map((s) => ({ ...s, content: [...s.content] }));
        next[index - 1] = {
          ...next[index - 1],
          content: [
            ...next[index - 1].content.slice(0, cIndex + 1),
            "",
            ...next[index - 1].content.slice(cIndex + 1),
          ],
        };
        return next;
      });
    },
    [index, setDataJson]
  );

  const DeletePoint = useCallback(
    (cIndex) => {
      setDataJson((prev) => {
        const next = prev.map((s) => ({ ...s, content: [...s.content] }));
        next[index - 1] = {
          ...next[index - 1],
          content: next[index - 1].content.filter((_, i) => i !== cIndex),
        };
        return next;
      });
    },
    [index, setDataJson]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
      if (isNaN(draggedIndex) || draggedIndex === dragOverIndex) return;
      setDataJson((prev) => {
        const next = [...prev.map((s) => ({ ...s, content: [...s.content] }))];
        const content = next[index - 1].content;
        const [moved] = content.splice(draggedIndex, 1);
        content.splice(dragOverIndex, 0, moved);
        return next;
      });
      setDragOverIndex(-1);
    },
    [dragOverIndex, index, setDataJson]
  );

  return (
    <li
      className="w-full bg-[#FAF5FF] border border-gray-200 rounded-2xl p-5 shadow-sm scroll-smooth overflow-y-auto"
      // Added scroll-smooth and overflow-y-auto to optimize scrolling
    >
      {/* Slide title area */}
      <div
        className="relative flex items-center justify-center mb-4"
      >
        <button
          type="button"
          onClick={() => DeleteSlide(index)}
          title="Delete slide"
          className="absolute left-0 flex items-center justify-center w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-500 transition-colors"
        >
          <span className="text-xl font-bold">×</span>
        </button>
        <input
          type="text"
          placeholder="Slide title"
          defaultValue={title}
          onChange={(e) => {
            const val = e.target.value;
            setDataJson((prev) => {
              const next = prev.map((s) => ({ ...s, content: [...s.content] }));
              next[index - 1].title = val;
              return next;
            });
          }}
          className="w-3/4 mx-auto text-center text-lg font-semibold placeholder-gray-500 bg-transparent rounded-md border-0 focus:outline-none focus:border-black focus:bg-white focus:text-black py-2 px-3"
        />
      </div>
      {/* Bullets */}
      <div className="">
        {points.map((item, cIndex) => (
          <LiPoint
            point={item}
            key={`${index}-${cIndex}`}
            index={cIndex}
            pIndex={index}
            setDataJson={setDataJson}
            deletePoint={DeletePoint}
            addPointBelow={AddPointBelow}
            cardBg="#FFFFFF"
            setDragOverIndex={setDragOverIndex}
            handleDrop={handleDrop}
          />
        ))}
      </div>
      {/* Add new slide below */}
      <button
        type="button"
        onClick={() => addSlideBelow(index)}
        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors space-x-2"
        // Changed to inline-flex, added space-x-2, wrapped text in span
      >
        <span className="text-lg font-bold">+</span>
        <span>Add a slide</span>
      </button>
    </li>
  );
}