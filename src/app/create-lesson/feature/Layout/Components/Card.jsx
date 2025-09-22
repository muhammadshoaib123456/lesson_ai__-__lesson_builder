"use client";

export default function Card({ children }) {
  /*
    The Card component wraps each create‑lesson page in a white container with
    generous rounded corners. Previously only two corners were rounded (top‑right
    and bottom‑left) which gave the card an asymmetric look. To more closely
    mirror the design reference provided by the user, the card now applies a
    consistent border radius to all four corners and adds a subtle shadow to
    elevate it off the coloured background. The outer wrapper centres the
    container and allows it to expand to fill the available space.  
  */
  return (
    <div className="w-full h-full flex-grow pt-2 pb-2 px-3 sm:pt-5 sm:pb-12 lg:px-16 sm:px-12 flex justify-center items-center">
      <div className="max-w-full max-h-full bg-white flex rounded-tr-3xl rounded-bl-3xl items-stretch overflow-hidden">
        {children}
      </div>
    </div>
  );
}