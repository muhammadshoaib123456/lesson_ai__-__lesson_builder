// "use client";

// import LargeNotes from "./LargeNotes.jsx";
// import DownloadButton from "./DownloadButton.jsx";

// export default function Bar({ data, loading, setFinalModal }) {
//   return (
//     <div className="h-full m-3 flex-grow justify-between items-center flex w-full">
//       <div className="border-[#545454] border-t-2 w-full h-[100%] pl-2 bg-[#d1d5db] flex items-center justify-between gap-3">
//         <div className="flex-1">
//           <LargeNotes data={data} />
//         </div>
//         {/* <div className="shrink-0 pr-2">
//           <DownloadButton />
//         </div> */}
//       </div>
//     </div>
//   );
// }



"use client";

import LargeNotes from "./LargeNotes.jsx";

export default function Bar({ data, loading, setFinalModal }) {
  return (
    <div className="w-full">
      {/* fixed height + internal scroll so the observer gets a non-zero value */}
      <div className="w-full h-40 overflow-hidden border-2 border-[#7d00a8] rounded-lg bg-[#f5edfa]">
        <div className="h-full overflow-y-auto p-3">
          <LargeNotes data={data} />
        </div>
      </div>
    </div>
  );
}
