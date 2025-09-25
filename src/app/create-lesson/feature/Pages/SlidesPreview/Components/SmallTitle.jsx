

"use client";

import React, { forwardRef } from "react";
import { useSelector } from "react-redux";

/**
 * SmallTitle
 *
 * Displays the lesson title in the thumbnail sidebar. When the user selects
 * this entry it draws a green outline to match the UI design; otherwise it
 * draws a light grey border with a green hover state. A `ref` is accepted
 * for scroll management from the parent component.
 */
const SmallTitle = forwardRef(({ setSelected, selected }, ref) => {
  const { reqPrompt } = useSelector((state) => state.promptData);
  const formattedPrompt = (reqPrompt || "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleClick = () => setSelected();

  return (
    <div
      className={`transition-all cursor-pointer rounded-lg bg-[#f5edfa] shadow-md bg-cover bg-center aspect-[16/9] flex h-full flex-col ${
        selected
          ? "border-4 border-green-500"
          : "border-2 border-[#7d00a8] hover:border-green-400"
      } overflow-hidden sm:w-auto sm:h-auto`}
      onClick={handleClick}
      ref={ref}
    >
      <div className="h-[4%] w-full bg-[#7d00a8] flex items-center justify-center"></div>
      <h1 className="h-[60%] flex flex-col-reverse lg:text-[55%] md:text-[40%] sm:text-[20%] text-[30%] px-[10%] py-[1%]">
        <b>{formattedPrompt}</b>
      </h1>
    </div>
  );
});

export default SmallTitle;























// "use client";

// import React, { forwardRef } from "react";
// import { useSelector } from "react-redux";

// const SmallTitle = forwardRef(({ setSelected, selected }, ref) => {
//   const { reqPrompt } = useSelector((state) => state.promptData);
//   const formattedPrompt = (reqPrompt || "")
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");

//   const handleClick = () => setSelected();

//   return (
//     <div
//       className={`transition-all  rounded-lg bg-white shadow-2xl bg-cover bg-center aspect-[16/9] flex h-full flex-col ${
//         selected ? "border-4 border-blue-400" : "border-2 border-gray-400"
//       } overflow-hidden sm:w-auto sm:h-auto`}
//       onClick={handleClick}
//       ref={ref}
//     >
//       <div className="h-[4%] w-full bg-[#7d00a8] flex items-center justify-center"></div>
//       <h1 className="h-[60%] flex flex-col-reverse lg:text-[55%] md:text-[40%] sm:text-[20%] text-[30%] px-[10%] py-[1%]">
//         <b>{formattedPrompt}</b>
//       </h1>
//     </div>
//   );
// });

// export default SmallTitle;
