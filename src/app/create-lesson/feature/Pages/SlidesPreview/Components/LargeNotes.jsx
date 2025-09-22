"use client";

import ScrollableText from "./ScrollableText";
import { useState, useEffect } from "react";

export default function LargeNotes({ data }) {
  const [height, setHeight] = useState(100);

  useEffect(() => {
    const el = document.getElementById("div1");
    if (!el) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      setHeight(entries[0].contentBoxSize?.[0]?.blockSize ?? el.clientHeight);
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      id="div1"
      className="bg-[#d1d5db] w-full h-full text-black xl:text-lg sm:text-md text-xs"
    >
      <ScrollableText children={data} maxHeight={height * 0.8} />
    </div>
  );
}
