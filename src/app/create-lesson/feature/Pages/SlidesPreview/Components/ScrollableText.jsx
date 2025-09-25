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

    // Recalculate when the container size or content changes
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scrollable-text ${isOverflowing ? "overflowing" : ""}`}
      style={{ width: "100%", maxHeight: `${maxHeight}px`, overflowY: "auto" }}
      onScroll={checkOverflow}
    >
      {children}
      {isOverflowing && <div className="scrollbar" />}
    </div>
  );
}
