
// add this file for responsive ness for largetile and small tile but its not wokring curruntly

"use client";

import React from "react";
import SmallTile from "./SmallTile";
import LargeTile from "./LargeTile";

export default function LessonPreview({
  slides,
  selectedIndex,
  setSelectedIndex,
  images,
}) {
  return (
    <div
      className="
        flex flex-col-reverse lg:flex-row 
        w-full h-screen bg-white gap-3 
        p-3 overflow-hidden
      "
    >
      {/* === Large Tile Area === */}
      <div
        className="
          flex-1 h-[70vh] lg:h-full 
          flex justify-center items-center
        "
      >
        <LargeTile
          data={slides[selectedIndex]}
          image={images[selectedIndex]}
        />
      </div>

      {/* === Small Tiles Section (slider on mobile, sidebar on desktop) === */}
      <div
        className="
          w-full lg:w-[25%] 
          flex lg:flex-col flex-row 
          overflow-x-auto lg:overflow-y-auto 
          scrollbar-thin scrollbar-thumb-gray-300
          gap-3 p-2
        "
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="min-w-[140px] sm:min-w-[160px] lg:min-w-full"
          >
            <SmallTile
              data={slide}
              image={images[index]}
              selected={selectedIndex === index}
              setSelected={() => setSelectedIndex(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
