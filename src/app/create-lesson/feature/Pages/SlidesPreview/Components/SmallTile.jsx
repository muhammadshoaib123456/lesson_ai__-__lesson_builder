

"use client";

import React, { useEffect, useState, forwardRef } from "react";

/**
 * SmallTile
 *
 * A small thumbnail representation of a generated slide. It displays the
 * slide title, a tiny preview image if available and the bullet points. When
 * selected it shows a green outline to match the design. The component is
 * responsive, scaling text sizes at different breakpoints. It accepts a
 * `ref` so the parent can scroll it into view.
 */
const SmallTile = forwardRef(({ data, setSelected, selected, image }, ref) => {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (image?.image_data !== undefined && image?.image_data !== "") {
      setLoading(false);
      setImageUrl(`data:image/png;base64,${image.image_data}`);
    }
  }, [image]);

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
      <h1 className="text-center h-[15%] md:text-[4px] xl:text-[6px] sm:text-[2px] p-[2%] text-[2px]">
        {data?.title}
      </h1>
      <div className="flex w-full h-[85%] flex-row-reverse items-center">
        {/* Image preview */}
        <div className="h-full w-full flex justify-center items-center">
          <div className="lg:w-[80%] lg:h-[80%] sm:w-[50%] sm:h-[50%] w-[50%] h-[50%] grid place-items-center outline overflow-clip">
            {loading ? (
              <div className="animate-spin border border-l-black w-[20%] h-[20%] rounded-full"></div>
            ) : (
              <img src={imageUrl} alt="image" className="w-full h-full object-contain" />
            )}
          </div>
        </div>
        {/* Bullet points */}
        <ul className="flex justify-top items-top pt-2 pl-[2.4%] flex-col w-full h-full list-none">
          {data?.content?.map((i, index) => (
            <li key={index} className="sm:text-[1px] xl:text-[3px] text-[1px]">
              {i}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default SmallTile;





























// "use client";

// import React, { useEffect, useState, forwardRef } from "react";

// const SmallTile = forwardRef(({ data, setSelected, selected, image }, ref) => {
//   const [loading, setLoading] = useState(true);
//   const [imageUrl, setImageUrl] = useState("");

//   useEffect(() => {
//     if (image?.image_data !== undefined && image?.image_data !== "") {
//       setLoading(false);
//       setImageUrl(`data:image/png;base64,${image.image_data}`);
//     }
//   }, [image]);

//   const handleClick = () => setSelected();

//   return (
//     <div
//       className={` transition-all rounded-lg bg-white shadow-2xl bg-cover bg-center aspect-[16/9] flex h-full flex-col ${
//         selected ? "border-4 border-blue-400" : "border-2 border-gray-400"
//       } overflow-hidden sm:w-auto sm:h-auto `}
//       onClick={handleClick}
//       ref={ref}
//     >
//       <div className="h-[4%] w-full bg-[#7d00a8] flex items-center justify-center"></div>
//       <h1 className="text-center h-[15%] md:text-[4px] xl:text-[6px] sm:text-[2px] p-[2%] text-[2px]">
//         {data?.title}
//       </h1>

//       <div className="flex w-full h-[85%] flex-row-reverse items-center">
//         <div className="h-full w-full flex justify-center items-center">
//           <div className="lg:w-[80%] lg:h-[80%] sm:w-[50%] sm:h-[50%] w-[50%] h-[50%] grid place-items-center outline overflow-clip">
//             {loading ? (
//               <div className="animate-spin border  border-l-black w-[20%] h-[20%] rounded-full"></div>
//             ) : (
//               <img src={imageUrl} alt="image" className="w-full h-full object-contain " />
//             )}
//           </div>
//         </div>

//         <ul className="flex justify-top items-top pt-2 pl-[2.4%] flex-col w-full h-full list-none">
//           {data?.content?.map((i, index) => (
//             <li key={index} className="sm:text-[1px] xl:text-[3px] text-[1px]">
//               {i}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// });

// export default SmallTile;
