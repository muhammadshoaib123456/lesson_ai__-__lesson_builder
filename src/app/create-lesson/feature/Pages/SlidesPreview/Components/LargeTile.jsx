"use client";

import { useEffect, useState } from "react";

export default function LargeTile({ data, image }) {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

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
    // stripped outer card styles; this is just slide content
    <div className="h-full w-full aspect-[16/9] flex flex-col">
      <div className="h-[4%] w-full bg-[#7d00a8]"></div>

      <h1
        className={`text-center h-[13%] xl:text-[130%] lg:text-[120%] ${
          (data?.title?.length ?? 0) < 10
            ? "text-lg"
            : (data?.title?.length ?? 0) < 80
            ? "text-md"
            : (data?.title?.length ?? 0) < 120
            ? "text-sm"
            : "text-xs"
        } whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        <b>{data?.title}</b>
      </h1>

      <div className="flex w-full h-[82%] flex-row-reverse items-center">
        {/* image area */}
        <div className="h-full w-full flex justify-center items-center">
          <div className="w-[80%] h-[80%] grid place-items-center outline outline-2 overflow-clip">
            {loading ? (
              <div className="animate-spin border-4 border-l-black w-20 h-20 rounded-full" />
            ) : (
              <img src={imageUrl} alt="image" className="w-full h-full object-contain" />
            )}
          </div>
        </div>

        {/* bullets */}
        <div className="flex justify-start items-start pl-[5%] flex-col w-full h-full">
          <ul className="pt-2 list-disc">
            {data?.content?.map((i, index) => {
              const text = i?.substring ? i.substring(1) : i;
              if (text && text.trim()) {
                return (
                  <li
                    key={index}
                    className="text-[8px] sm:text-[11px] md:text-[14px] xl:text-[15px]"
                  >
                    {text}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
