





"use client";

import { useEffect, useState } from "react";

// === Responsive Font Hook ===
const determinePointSize = (data, slideType) => {
  const pointSize = {
    largeTile: {
      sh_text: {
        def: "8px",           // base size (very small screens)
        sm: "clamp(8px, 1.5vw + 2px, 10px)",         // small screen (≥640px)
        md: "12px",                    // medium screen (≥768px)
        lg: "13px",                    // large screen (≥1024px)
        xl: "14px",                    // extra-large screen (≥1280px)
        dxl: "15px",                   // double-extra-large (≥1536px)
      },
      lng_text: {
        def: "10px",
        sm: "clamp(9px, 1.5vw + 2px, 11px)",
        md: "13px",
        lg: "14px",
        xl: "15px",
        dxl: "16px",
      },
    },
  };

  if (!data) return pointSize.largeTile.lng_text;

  for (let i = 0; i < data.length; i++) {
    if (data[i].length > 40) {
      return pointSize[slideType]["sh_text"];
    }
  }
  return pointSize[slideType]["lng_text"];
};

function useResponsiveFontSize(data, slideType) {
  const [fontSize, setFontSize] = useState(
    () => determinePointSize(data, slideType).def
  );

  useEffect(() => {
    if (!data) return;
    const pointSize = determinePointSize(data, slideType);

    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width < 640) setFontSize(pointSize.def);
      else if (width < 768) setFontSize(pointSize.sm);
      else if (width < 1024) setFontSize(pointSize.md);
      else if (width < 1280) setFontSize(pointSize.lg);
      else if (width < 1536) setFontSize(pointSize.xl);
      else setFontSize(pointSize.dxl);
    };

    updateFontSize();
    window.addEventListener("resize", updateFontSize);
    return () => window.removeEventListener("resize", updateFontSize);
  }, [data]);

  return fontSize;
}

// === Main LargeTile Component ===
export default function LargeTile({ data, image }) {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const fontSize = useResponsiveFontSize(data?.content, "largeTile");

  useEffect(() => {
    if (image?.image_data !== undefined && image?.image_data !== "") {
      setLoading(false);
      setImageUrl(`data:image/png;base64,${image.image_data}`);
    } else {
      setLoading(true);
      setImageUrl("");
    }
  }, [image]);

  return (
    <div className="h-full w-full aspect-[16/9] flex flex-col bg-white shadow-xl rounded-lg overflow-hidden font-[Inter,sans-serif]">
      {/* Top purple bar */}
      <div className="h-[4%] w-full bg-[#7d00a8]" />

      {/* Title */}
      <h1
        className={`text-center h-[13%] flex items-center justify-center px-4
          whitespace-nowrap overflow-hidden text-ellipsis
          font-semibold text-gray-800 tracking-tight
          ${
            (data?.title?.length ?? 0) < 10
              ? "text-2xl"
              : (data?.title?.length ?? 0) < 80
              ? "text-xl"
              : (data?.title?.length ?? 0) < 120
              ? "text-lg"
              : "text-base"
          }`}
      >
        {data?.title}
      </h1>

      {/* Content + Image Area */}
      <div className="flex w-full h-[82%] flex-row-reverse items-center bg-gradient-to-r from-purple-50/40 to-white">
        {/* === IMAGE AREA === */}
        <div className="h-full w-2/5 flex justify-center items-center">
          <div className="w-[90%] max-h-[90%] flex items-center justify-center overflow-hidden border-2 border-[#7d00a8]/50 rounded-lg p-2 shadow-sm bg-white">
            {loading ? (
              <div className="animate-spin w-10 h-10 border-4 border-[#7d00a8] border-t-transparent rounded-full" />
            ) : (
              <img
                src={imageUrl}
                alt="image"
                className="w-full h-auto max-h-full object-contain block"
              />
            )}
          </div>
        </div>

        {/* === CONTENT AREA === */}
        <div className="flex flex-col justify-start items-start pl-[5%] w-3/5 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-4">
          <ul className="pt-2 list-disc space-y-3 w-full text-gray-800">
            {data?.content?.map((contentItem, index) => {
              // remove leading/trailing dashes or spaces
              const contentText = contentItem
                ?.replace(/^[-\s]+|[-\s]+$/g, "")
                ?.trim() || "";

              const subContentText =
                data?.sub_content && data?.sub_content[index]
                  ? data.sub_content[index]
                      .replace(/^[-\s]+|[-\s]+$/g, "")
                      .trim()
                  : null;

              if (!contentText) return null;

              return (
                <li
                  key={index}
                  style={{ fontSize }}
                  className="leading-snug font-medium text-purple-800"
                >
                  {contentText}
                  {/* Subcontent (no bullets + dash removed) */}
                  {subContentText && (
                    <div
                      className="text-gray-700 font-normal mt-1 ml-4"
                      style={{
                        fontSize: `calc(${fontSize} * 0.95)`,
                      }}
                    >
                      {subContentText}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}







































































// "use client";

// import { useEffect, useState } from "react";

// export default function LargeTile({ data, image }) {
//   const [loading, setLoading] = useState(true);
//   const [imageUrl, setImageUrl] = useState("");

//   useEffect(() => {
//     if (image?.image_data !== undefined && image?.image_data !== "") {
//       setLoading(false);
//       setImageUrl(`data:image/png;base64,${image.image_data}`);
//     } else {
//       setLoading(true);
//       setImageUrl("");
//     }
//   }, [image]);

//   return (
//     // stripped outer card styles; this is just slide content
//     <div className="h-full w-full aspect-[16/9] flex flex-col">
//       <div className="h-[4%] w-full bg-[#7d00a8]"></div>

//       <h1
//         className={`text-center h-[13%] xl:text-[130%] lg:text-[120%] ${
//           (data?.title?.length ?? 0) < 10
//             ? "text-lg"
//             : (data?.title?.length ?? 0) < 80
//             ? "text-md"
//             : (data?.title?.length ?? 0) < 120
//             ? "text-sm"
//             : "text-xs"
//         } whitespace-nowrap overflow-hidden text-ellipsis`}
//       >
//         <b>{data?.title}</b>
//       </h1>

//       <div className="flex w-full h-[82%] flex-row-reverse items-center">
//         {/* image area */}
//         <div className="h-full w-2/5 flex justify-center items-center">
//           {/* Frame fills 90% width of the column and is capped by 90% of column height */}
//           <div className="w-[90%] max-h-[90%] flex items-center justify-center overflow-hidden border border-[#7d00a8] rounded-md p-2">
//             {loading ? (
//               <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full" />
//             ) : (
//               <img
//                 src={imageUrl}
//                 alt="image"
//                 /* Fill width, let height follow aspect; never exceed frame's height */
//                 className="w-full h-auto max-h-full object-contain block"
//               />
//             )}
//           </div>
//         </div>

//         {/* bullets */}
//         <div className="flex justify-start items-start pl-[5%] flex-col w-3/5 h-full">
//           <ul className="pt-2 list-disc">
//             {data?.content?.map((i, index) => {
//               const text = i?.substring ? i.substring(1) : i;
//               if (text && text.trim()) {
//                 return (
//                   <li
//                     key={index}
//                     className="text-[8px] sm:text-[11px] md:text-[14px] xl:text-[15px]"
//                   >
//                     {text}
//                   </li>
//                 );
//               }
//               return null;
//             })}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }
