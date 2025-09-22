"use client";

import { useEffect, useState } from "react";

export default function LargeTable({ data }) {
  const numPoints = 6;
  const [pointSize, setPointSize] = useState(determine_point_size(data));
  const [fontSize, setFontSize] = useState(determine_point_size(data));

  useEffect(() => {
    setPointSize(determine_point_size(data));
  }, [data]);

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setFontSize(pointSize.def);
      } else if (width < 768) {
        setFontSize(pointSize.sm);
      } else if (width < 1024) {
        setFontSize(pointSize.md);
      } else if (width < 1280) {
        setFontSize(pointSize.lg);
      } else {
        setFontSize(pointSize.xl);
      }
    };
    updateFontSize();
    window.addEventListener("resize", updateFontSize);
    return () => window.removeEventListener("resize", updateFontSize);
  }, [pointSize]);

  return (
    // removed outer white card; just the inner slide content
    <div className="h-full w-full aspect-[16/9] flex flex-col overflow-hidden">
      <div className="h-[4%] w-full bg-[#7d00a8]"></div>

      <h1 className="text-center h-[13%] xl:text-[170%] lg:text-[150%] sm:text-[100%] text-md p-[2%]">
        <b>Table of Contents</b>
      </h1>

      <div className="flex w-full h-[82%] flex-row-reverse items-center">
        {/* right column (items 7…n) */}
        <div className="flex p-[0.5%] sm:p-[2.4%] flex-col w-full h-full list-none justify-start items-start overflow-hidden">
          {data.map((i, index) =>
            index >= numPoints ? (
              <li
                key={index}
                className="p-0 mt-2 sm:mt-3 flex flex-row justify-top items-top w-full overflow-hidden"
                style={{ fontSize }}
              >
                <span className="p-1 text-white mr-1 bg-[#7d00a8] border border-black flex justify-center items-center lg:w-6 lg:h-6 md:w-4 md:h-4 sm:w-2 sm:h-2 h-2 w-2">
                  {index + 1}
                </span>
                <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {i}
                </span>
              </li>
            ) : null
          )}
        </div>

        {/* left column (items 1…6) */}
        <div className="flex p-[0.5%] sm:p-[2.4%] flex-col w-full h-full list-none justify-start items-start overflow-hidden">
          {data.map((i, index) =>
            index < numPoints ? (
              <li
                key={index}
                className="p-0 mt-2 sm:mt-3 flex flex-row justify-top items-top w-full"
                style={{ fontSize }}
              >
                <span className="p-1 text-white mr-1 bg-[#7d00a8] border border-black flex justify-center items-center lg:w-5 lg:h-5 md:w-4 md:h-4 sm:w-2 sm:h-2 h-2 w-2">
                  {index + 1}
                </span>
                <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {i}
                </span>
              </li>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

const determine_point_size = (data = []) => {
  const point_size = {
    sh_text: { def: "6px", sm: "clamp(4px, 2vw + 2px, 6px)", md: "8px", lg: "9px", xl: "10px" },
    lng_text: { def: "8px", sm: "clamp(5px, 1vw + 1px, 7px)", md: "10px", lg: "11px", xl: "12px" },
  };
  for (let i = 0; i < data.length; i++) {
    if ((data[i] || "").length > 40) return point_size.sh_text;
  }
  return point_size.lng_text;
};
