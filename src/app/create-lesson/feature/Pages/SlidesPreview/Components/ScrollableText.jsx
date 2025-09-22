"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ScrollableText({ children, maxHeight = 70 }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textAreaRef = useRef(null);

  useEffect(() => {
    const element = textAreaRef.current;
    if (element) {
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [children]);

  const handleScroll = () => {
    if (!textAreaRef.current) return;
    setIsOverflowing(
      textAreaRef.current.scrollHeight > textAreaRef.current.clientHeight
    );
  };

  return (
    <div
      className={`scrollable-text ${isOverflowing ? "overflowing" : ""}`}
      style={{ width: "100%", maxHeight: `${maxHeight}px`, overflow: "auto" }}
    >
      <div ref={textAreaRef} onScroll={handleScroll}>
        {children}
      </div>
      {isOverflowing && <div className="scrollbar"></div>}
    </div>
  );
}
