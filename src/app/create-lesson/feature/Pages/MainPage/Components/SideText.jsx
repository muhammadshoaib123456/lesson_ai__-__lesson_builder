"use client";

export default function SideText() {
  // Only the supporting line; the main title is centered at the top in index.jsx
  return (
    <div className="flex w-full flex-col">
      <p className="text-left text-base md:text-lg text-gray-700">
        Create interactive, accurate AI-powered lessons for engaged classrooms
      </p>
    </div>
  );
}






















// "use client";

// export default function SideText() {
//   return (
//     <div className="flex flex-col items-top w-full">
//       <h1 className="text-left xl:text-4xl lg:text-3xl md:text-3xl text-3xl w-full">
//         <span className="font-superBlack text-purple-primary">
//           Lessn Builder
//         </span>
//       </h1>
//       <p className="text-left xl:text-xl md:text-lg lg:text-sm text-purple-secondary w-full">
//         Create interactive, accurate AI-powered lessons for engaged classrooms
//       </p>
//     </div>
//   );
// }