"use client";

import LargeNotes from "./LargeNotes.jsx";
import DownloadButton from "./DownloadButton.jsx";

export default function Bar({ data, loading, setFinalModal }) {
  return (
    <div className="h-full m-3 flex-grow justify-between items-center flex w-full">
      <div className="border-[#545454] border-t-2 w-full h-[100%] pl-2 bg-[#d1d5db] flex items-center justify-between gap-3">
        <div className="flex-1">
          <LargeNotes data={data} />
        </div>
        <div className="shrink-0 pr-2">
          <DownloadButton />
        </div>
      </div>
    </div>
  );
}
