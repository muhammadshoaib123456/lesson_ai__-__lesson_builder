

"use client";

import React, { forwardRef, useState } from "react";

/**
 * SmallTable
 *
 * A compact table of contents thumbnail. It splits the entries into two
 * columns and numbers them. When selected it draws a green outline; otherwise
 * it draws a light grey outline that turns green on hover. The component
 * accepts a `ref` so the parent can manage scrolling.
 */
const SmallTable = forwardRef(({ data, setSelected, selected }, ref) => {
  const [numPoints] = useState(6);

  const handleClick = () => setSelected();

  return (
    <div
      className={`transition-all cursor-pointer w-full rounded-lg bg-[#f5edfa] shadow-md bg-cover bg-center aspect-[16/9] flex h-full flex-col ${
        selected
          ? "border-4 border-green-500"
          : "border-2 border-[#7d00a8] hover:border-green-400"
      } overflow-hidden sm:w-auto sm:h-auto`}
      onClick={handleClick}
      ref={ref}
    >
      <div className="h-[4%] w-full bg-[#7d00a8] flex items-center justify-center"></div>
      <h1 className="text-center h-[15%] md:text-[4px] sm:text-[2px] text-[3px] xl:text-[5px] p-[2%]">
        Table of Contents
      </h1>
      <div className="flex h-[85%] flex-row-reverse items-center justify-between">
        {/* Right column */}
        <div className="flex p-[2.4%] flex-col w-full h-full list-none">
          {data.map((i, index) =>
            index >= numPoints ? (
              <li
                className="py-[1%] md:text-[2px] xl:text-[3px] sm:text-[1px] text-[2px] mt-1"
                key={index}
              >
                <span
                  className="p-[1%] px-[1%] text-white mr-[10%] mb-[2%]"
                  style={{
                    backgroundColor: "#7d00a8",
                    border: "0px solid black",
                    borderRadius: "1px",
                  }}
                >
                  {index + 1}
                </span>
                {i}
              </li>
            ) : null
          )}
        </div>
        {/* Left column */}
        <div className="flex p-[2.4%] flex-col w-[50%] h-full list-none">
          {data.map((i, index) =>
            index < numPoints ? (
              <li
                className="py-[1%] md:text-[2px] xl:text-[3px] sm:text-[1px] text-[2px] mt-1"
                key={index}
              >
                <span
                  className="p-[1%] px-[1%] text-white mr-[10%] mb-[2%]"
                  style={{
                    backgroundColor: "#7d00a8",
                    border: "0px solid black",
                    borderRadius: "1px",
                  }}
                >
                  {index + 1}
                </span>
                {i}
              </li>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
});

export default SmallTable;


































// "use client";

// import React, { forwardRef, useState } from "react";

// const SmallTable = forwardRef(({ data, setSelected, selected }, ref) => {
//   const [numPoints] = useState(6);

//   const handleClick = () => setSelected();

//   return (
//     <div
//       className={`transition-all w-full rounded-lg bg-white shadow-2xl bg-cover bg-center aspect-[16/9] flex h-full flex-col ${
//         selected ? "border-4 border-blue-400" : "border-2 border-gray-400"
//       } overflow-hidden sm:w-auto sm:h-auto`}
//       onClick={handleClick}
//       ref={ref}
//     >
//       <div className="h-[4%] w-full bg-[#7d00a8] flex items-center justify-center"></div>
//       <h1 className="text-center h-[15%] md:text-[4px] sm:text-[2px] text-[3px] xl:text-[5px] p-[2%]">
//         Table of Contents
//       </h1>
//       <div className="flex h-[85%] flex-row-reverse items-center justify-between">
//         <div className="flex p-[2.4%] flex-col w-full h-full list-none">
//           {data.map((i, index) =>
//             index >= numPoints ? (
//               <li
//                 className="py-[1%] md:text-[2px] xl:text-[3px] sm:text-[1px] text-[2px] mt-1"
//                 key={index}
//               >
//                 <span
//                   className="p-[1%] px-[1%] text-white mr-[10%] mb-[2%] "
//                   style={{ backgroundColor: "#7d00a8", border: "0px solid black", borderRadius: "1px" }}
//                 >
//                   {index + 1}
//                 </span>
//                 {i}
//               </li>
//             ) : null
//           )}
//         </div>

//         <div className="flex p-[2.4%] flex-col w-[50%] h-full list-none">
//           {data.map((i, index) =>
//             index < numPoints ? (
//               <li
//                 className="py-[1%] md:text-[2px] xl:text-[3px] sm:text-[1px] text-[2px] mt-1"
//                 key={index}
//               >
//                 <span
//                   className="p-[1%] px-[1%] text-white mr-[10%] mb-[2%] "
//                   style={{ backgroundColor: "#7d00a8", border: "0px solid black", borderRadius: "1px" }}
//                 >
//                   {index + 1}
//                 </span>
//                 {i}
//               </li>
//             ) : null
//           )}
//         </div>
//       </div>
//     </div>
//   );
// });

// export default SmallTable;
