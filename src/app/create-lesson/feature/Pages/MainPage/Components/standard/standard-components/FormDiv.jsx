"use client";

/*
 * FormDiv.jsx
 *
 * Displays a summary of the selected curriculum points and offers a
 * button to edit the selection.  This component adapts the React
 * implementation to work with the structure of the curriculum data
 * returned by the backend in the Next.js project.  The `fetchedContent`
 * prop is expected to be an object containing at least a `points`
 * property (an object of curriculum point trees) and optionally a
 * `suggested` array.  When no curriculum data has been fetched yet it
 * shows a skeleton loader.  When curriculum data exists but no points
 * have been selected it prompts the user to make a selection.
 */

export function FormDiv({ label, fetchedContent, selectedPoints, setEnlarge }) {
  // Determine whether any points have been selected.  In the
  // standards‑mode form we store selected curriculum points as an
  // array.  Support for the single‑object shape is retained for
  // backwards compatibility.
  const hasSelectedPoints = () => {
    // In the updated implementation selectedPoints may be a single
    // curriculum point object or an array (for legacy support).  Treat
    // either case as having points when non‑empty.
    if (Array.isArray(selectedPoints)) {
      return selectedPoints.length > 0;
    }
    if (selectedPoints && typeof selectedPoints === "object") {
      return Object.keys(selectedPoints).length > 0;
    }
    return false;
  };

  // Render the selected points into a list.  We attempt to use
  // `point_id` as the key when available, falling back to the index.
  const renderSelectedPoints = () => {
    if (Array.isArray(selectedPoints)) {
      return selectedPoints.map((p, idx) => (
        <li key={p.point_id || idx} className="mb-2 break-words">
          <p>{p.description}</p>
        </li>
      ));
    } else if (selectedPoints && typeof selectedPoints === "object") {
      // When a single point object is provided, display its description
      return (
        <li className="mb-2 break-words">
          <p>{selectedPoints.description || selectedPoints.point}</p>
        </li>
      );
    }
    return null;
  };

  // Determine if curriculum data has been fetched.  Because
  // `fetchedContent` is an object rather than an array we check its
  // keys.  If no keys exist then the call is still loading and the
  // skeleton loader is shown.
  const hasCurriculumData = () => {
    return fetchedContent && Object.keys(fetchedContent).length > 0;
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
            hasCurriculumData() ? "h-28" : "h-full"
          }`}
        >
          {hasCurriculumData() ? (
            // Curriculum data has been fetched
            hasSelectedPoints() ? (
              <div className="text-purple-700 w-full">
                <ul className="list-disc pl-5">{renderSelectedPoints()}</ul>
              </div>
            ) : (
              <p className="text-gray-500">
                {Array.isArray(selectedPoints)
                  ? "No curriculum points selected"
                  : "You must select a curriculum point to continue"}
              </p>
            )
          ) : (
            // Skeleton loader while fetching
            <div className="flex flex-col items-center justify-center w-full h-full animate-pulse">
              <div className="w-3/4 h-4 bg-gray-300 rounded-md mb-2"></div>
              <div className="w-2/3 h-4 bg-gray-300 rounded-md mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-300 rounded-md"></div>
            </div>
          )}
        </div>
        {/* Bottom fixed button */}
        {hasCurriculumData() && (
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