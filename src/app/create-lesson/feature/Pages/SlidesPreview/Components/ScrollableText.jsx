"use client"; // keep this in Next.js; remove it in plain React

import React, { useEffect, useRef, useState } from "react";

export default function ScrollableText({ children, maxHeight = 70 }) {
  const containerRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    const el = containerRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  };

  useEffect(() => {
    checkOverflow();
  }, [children, maxHeight]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="scrollable-text"
      style={{
        width: "100%",
        maxHeight: `${maxHeight}px`,
        overflow: "hidden", // removed scroll
      }}
    >
      {children}
    </div>
  );
}
