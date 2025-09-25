// "use client";

// import ScrollableText from "./ScrollableText";
// import { useState, useEffect } from "react";

// export default function LargeNotes({ data }) {
//   const [height, setHeight] = useState(100);

//   useEffect(() => {
//     const el = document.getElementById("div1");
//     if (!el) return;
//     const resizeObserver = new ResizeObserver((entries) => {
//       if (!entries || !entries[0]) return;
//       setHeight(entries[0].contentBoxSize?.[0]?.blockSize ?? el.clientHeight);
//     });
//     resizeObserver.observe(el);
//     return () => resizeObserver.disconnect();
//   }, []);

//   return (
//     <div
//       id="div1"
//       className="w-full h-full text-gray-800 xl:text-lg sm:text-md text-xs"
//     >
//       {/* The ScrollableText component will handle overflowing content. */}
//       <ScrollableText children={data} maxHeight={height * 0.8} />
//     </div>
//   );
// }
"use client";

import ScrollableText from "./ScrollableText";
import { useState, useEffect, useRef } from "react";

export default function LargeNotes({ data }) {
  const containerRef = useRef(null);
  const [height, setHeight] = useState(200); // sensible default so we never start at 0

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries?.[0];
      // Try modern box size first, then contentRect, then DOM measures
      const measured =
        entry?.contentBoxSize?.[0]?.blockSize ??
        entry?.contentRect?.height ??
        el.clientHeight;

      // Never allow zero/NaN
      setHeight(Number.isFinite(measured) && measured > 0 ? measured : 200);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep at least 160px visible for content
  const maxH = Math.max(160, Math.floor(height * 0.85));

  return (
    <div
      ref={containerRef}
      className="w-full h-full text-gray-800 xl:text-lg sm:text-md text-xs"
    >
      <ScrollableText maxHeight={maxH}>{data}</ScrollableText>
    </div>
  );
}
