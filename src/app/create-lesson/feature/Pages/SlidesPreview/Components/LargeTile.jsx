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
        <div className="h-full w-2/5 flex justify-center items-center">
          {/* Frame fills 90% width of the column and is capped by 90% of column height */}
          <div className="w-[90%] max-h-[90%] flex items-center justify-center overflow-hidden border border-[#7d00a8] rounded-md p-2">
            {loading ? (
              <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full" />
            ) : (
              <img
                src={imageUrl}
                alt="image"
                /* Fill width, let height follow aspect; never exceed frame's height */
                className="w-full h-auto max-h-full object-contain block"
              />
            )}
          </div>
        </div>

        {/* bullets */}
        <div className="flex justify-start items-start pl-[5%] flex-col w-3/5 h-full">
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
