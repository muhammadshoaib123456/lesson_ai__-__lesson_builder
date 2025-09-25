"use client";

import NextImage from "next/image";
import man from "../assets/man.svg";

export default function Image() {
  // Clean image (no shadow, no border, no wrapper box)
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <NextImage
        src={man}
        alt="Illustration of man"
        className="w-full h-auto object-contain"
        priority
      />
    </div>
  );
}







































// "use client";

// import NextImage from "next/image";
// import man from "../assets/man.svg";

// export default function Image() {
//   /*
//     Render the hero illustration on the main create‑lesson page. To ensure the
//     artwork fills the allotted space without leaving awkward gaps, the image is
//     wrapped in a flex container and given explicit width and height via
//     Tailwind utility classes. The `object-contain` rule preserves the
//     illustration’s aspect ratio while allowing it to scale up to fill the
//     container both horizontally and vertically. Using `priority` causes Next.js
//     to preload the asset so it appears instantly when the page loads.
//   */
//   return (
//     <div className="flex-1 flex items-center justify-center">
//       <NextImage
//         src={man}
//         alt="Illustration of man"
//         className="w-full h-full object-contain"
//         priority /* preload the image (no lazy loading) */
//       />
//     </div>
//   );
// }