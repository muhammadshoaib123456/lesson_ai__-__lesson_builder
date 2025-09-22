"use client";

import LiPoint from "./LiPoint.jsx";
import uuid from "react-uuid";
import { useCallback } from "react";

export default function SlideComponent({
  points,
  setDataJson,
  index,
  title,
  DeleteSlide,
  addSlideAbove,
  addSlideBelow,
}) {
  // ---------- CONFIG: adjust these if you want ----------
  const cardBg = "#D6D5E6";        // Card background color (matches screenshot)
  const bottomPadClass = "pb-12";  // Padding at bottom so arrows don't cover bullets
  // ------------------------------------------------------

  // helpers
  const AddPoint = useCallback(() => {
    setDataJson((prev) => {
      const next = prev.map((s) => ({ ...s, content: [...s.content] }));
      next[index - 1] = {
        ...next[index - 1],
        content: [...next[index - 1].content, ""],
      };
      return next;
    });
  }, [index, setDataJson]);

  const AddPointAbove = useCallback(
    (cIndex) => {
      setDataJson((prev) => {
        const next = prev.map((s) => ({ ...s, content: [...s.content] }));
        next[index - 1] = {
          ...next[index - 1],
          content: [
            ...next[index - 1].content.slice(0, cIndex),
            "",
            ...next[index - 1].content.slice(cIndex),
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

  return (
    <li
      className={`w-full rounded-2xl p-4 shadow-sm relative ${bottomPadClass}`}
      style={{ backgroundColor: cardBg }}
    >
      {/* Title row: cross on left, title centered (same line) */}
      <div className="relative flex items-center justify-center mb-2">
        {/* Cross */}
        <button
          type="button"
          onClick={() => DeleteSlide(index)}
          title="Delete slide"
          className="absolute left-0 flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          <span className="text-xl font-bold">×</span>
        </button>

        {/* Title (border hidden by default; appears on focus) */}
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
          className="w-3/4 mx-auto text-center text-lg font-semibold placeholder-gray-500
                     bg-transparent rounded-md border-2 transition
                     focus:outline-none focus:border-black focus:bg-white focus:text-black
                     py-2 px-3"
          style={{
            borderColor: cardBg, // invisible at rest (same as card)
          }}
        />
      </div>

      {/* Bullets */}
      <div className="space-y-1"> 
        {/* ↑ reduce vertical space between bullet rows by decreasing space-y */}
        {points.map((item, cIndex) => (
          <LiPoint
            point={item}
            key={uuid()}
            index={cIndex}
            pIndex={index}
            setDataJson={setDataJson}
            deletePoint={DeletePoint}
            addPointAbove={AddPointAbove}
            cardBg={cardBg} // keeps borders invisible at rest
          />
        ))}

        {/* Add bullet */}
        <div className="flex justify-start pt-1">
          {/* <button
            type="button"
            onClick={AddPoint}
            className="flex items-center justify-center w-8 h-8 text-purple-600 border border-purple-300 rounded-full hover:bg-purple-50 transition-colors"
            title="Add bullet"
          >
            <span className="text-xl leading-none">+</span>
          </button> */}
        </div>
      </div>

      {/* Arrows (inside card, bottom-right). If they get clipped, ensure parent container doesn't set overflow:hidden */}
      <div className="absolute bottom-3 right-3 flex space-x-2">
        <button
          type="button"
          onClick={() => addSlideBelow(index)}
          title="Move down"
          className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M10.9393 23.0607C11.5251 23.6464 12.4749 23.6464 13.0607 23.0607L22.6066 13.5147C23.1924 12.9289 23.1924 11.9792 22.6066 11.3934C22.0208 10.8076 21.0711 10.8076 20.4853 11.3934L12 19.8787L3.51472 11.3934C2.92893 10.8076 1.97918 10.8076 1.3934 11.3934C0.807611 11.9792 0.807611 12.9289 1.3934 13.5147L10.9393 23.0607ZM10.5 0L10.5 22H13.5L13.5 0L10.5 0Z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => addSlideAbove(index)}
          title="Move up"
          className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M13.0607 0.93934C12.4749 0.353553 11.5251 0.353553 10.9393 0.93934L1.3934 10.4853C0.807612 11.0711 0.807612 12.0208 1.3934 12.6066C1.97918 13.1924 2.92893 13.1924 3.51472 12.6066L12 4.12132L20.4853 12.6066C21.0711 13.1924 22.0208 13.1924 22.6066 12.6066C23.1924 12.0208 23.1924 11.0711 22.6066 10.4853L13.0607 0.93934ZM13.5 24L13.5 2H10.5L10.5 24H13.5Z" />
          </svg>
        </button>
      </div>
    </li>
  );
}
