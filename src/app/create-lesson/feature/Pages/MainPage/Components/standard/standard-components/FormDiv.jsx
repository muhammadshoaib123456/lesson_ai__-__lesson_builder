"use client";

export function FormDiv({ label, fetchedContent, selectedPoints, setEnlarge }) {
  // Check if points are selected
  const hasSelectedPoints = () => {
    if (Array.isArray(selectedPoints)) {
      return selectedPoints.length > 0;
    }
    return selectedPoints?.point && selectedPoints?.pointId;
  };

  // Render selected points
  const renderSelectedPoints = () => {
    if (Array.isArray(selectedPoints)) {
      return selectedPoints.map((p, idx) => (
        <li key={p.point_id || idx} className="mb-2 break-words">
          <p>{p.description}</p>
        </li>
      ));
    } else if (selectedPoints?.point) {
      return (
        <li className="mb-2 break-words">
          <p>{selectedPoints.point}</p>
        </li>
      );
    }
    return null;
  };

  return (
    <div className="relative mb-2 w-4/5">
      {/* Label */}
      <label className="w-full flex mb-2">
        <span className="text-sm flex text-purple-600 items-center justify-start w-full font-medium">
          {label}
        </span>
      </label>

      {/* Container with fixed height */}
      <div className="relative text-base text-purple-700 rounded-3xl rounded-tr-none border border-purple-300 w-full h-40 bg-gray-100 overflow-hidden">
        {/* Scrollable content */}
        <div
          className={`overflow-y-auto p-3 pb-12 ${
            fetchedContent?.length > 0 ? "h-28" : "h-full"
          }`}
        >
          {fetchedContent ? (
            fetchedContent.length === 0 ? (
              <p className="text-gray-500">No content found</p>
            ) : hasSelectedPoints() ? (
              <div className="text-purple-700 w-full">
                <ul className="list-disc pl-5">{renderSelectedPoints()}</ul>
              </div>
            ) : (
              <p className="text-gray-500">
                {Array.isArray(selectedPoints)
                  ? "No related points selected"
                  : "You must select a curriculum point to continue"}
              </p>
            )
          ) : (
            // Skeleton loader
            <div className="flex flex-col items-center justify-center w-full h-full animate-pulse">
              <div className="w-3/4 h-4 bg-gray-300 rounded-md mb-2"></div>
              <div className="w-2/3 h-4 bg-gray-300 rounded-md mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-300 rounded-md"></div>
            </div>
          )}
        </div>

        {/* Bottom fixed button */}
        {fetchedContent && (
          <div className="absolute bottom-0 left-0 right-0">
            <button
              className="w-full bg-purple-600 text-white py-2 hover:bg-purple-700 transition rounded-b-3xl"
              type="button"
              onClick={() => setEnlarge(true)}
            >
              Edit Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
