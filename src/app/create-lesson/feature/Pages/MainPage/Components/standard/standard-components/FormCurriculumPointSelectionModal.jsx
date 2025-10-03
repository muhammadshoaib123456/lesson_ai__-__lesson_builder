"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { ChevronDown, ChevronRight, X, Star, List } from "lucide-react";

// Recursive TreeNode component
export const TreeNode = ({
  item,
  depth = 0,
  selectedPoints,
  onPointToggle,
  expandedNodes,
  toggleNode,
  maxSelections = 3,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedNodes.has(item.point_id);
  const isLeaf = !hasChildren;
  const isSelected = selectedPoints.some(
    (point) => point.point_id === item.point_id
  );
  const canSelect = selectedPoints.length < maxSelections || isSelected;

  // Format display text
  const displayText = item.code
    ? `${item.code}: ${item.description}`
    : item.description;

  const handleToggle = () => {
    if (hasChildren) {
      toggleNode(item.point_id);
    }
  };

  const handleCheckboxChange = () => {
    if (isLeaf) {
      onPointToggle(item);
    }
  };

  return (
    <div className="w-full my-2">
      <div
        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer
          ${depth === 0 ? "bg-purple-50 font-semibold" : ""}
          ${depth === 1 ? "bg-gray-50" : ""}
          ${isSelected ? "bg-purple-100 border border-purple-300" : ""}`}
        // using Tailwind arbitrary padding class for nesting
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Toggle button for nodes with children */}
        {hasChildren && (
          <button
            type="button"
            onClick={handleToggle}
            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}

        {/* Checkbox for leaf nodes */}
        {isLeaf && (
          <input
            type="checkbox"
            className={`form-checkbox text-purple-600 accent-purple-600 flex-shrink-0 
              ${!canSelect ? "opacity-50 cursor-not-allowed" : ""}`}
            checked={isSelected}
            onChange={handleCheckboxChange}
            disabled={!canSelect}
          />
        )}

        {/* Node text */}
        <span
          className={`text-sm ${isLeaf ? "text-purple-700" : "text-gray-700"}
            ${depth === 0 ? "font-semibold text-purple-500" : ""}
            ${isSelected ? "font-medium" : ""}`}
          onClick={hasChildren ? handleToggle : undefined}
        >
          {displayText}
        </span>
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {item.children.map((child) => (
            <TreeNode
              key={child.point_id}
              item={child}
              depth={depth + 1}
              selectedPoints={selectedPoints}
              onPointToggle={onPointToggle}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              maxSelections={maxSelections}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Suggested points list
const SuggestedPointsList = ({
  suggestedPoints,
  selectedPoints,
  onPointToggle,
  maxSelections = 3,
}) => {
  return (
    <div className="space-y-3">
      {suggestedPoints.map((point) => {
        const isSelected = selectedPoints.some(
          (p) => p.point_id === point.point_id
        );
        const canSelect = selectedPoints.length < maxSelections || isSelected;

        return (
          <div
            key={point.point_id}
            className={`flex items-start gap-3 p-4 rounded-lg border transition-colors 
              ${isSelected
                ? "bg-purple-100 border-purple-300"
                : "bg-white border-gray-200 hover:bg-gray-50"}`}
          >
            <input
              type="checkbox"
              className={`form-checkbox text-purple-600 accent-purple-600 mt-1 flex-shrink-0 
                ${!canSelect ? "opacity-50 cursor-not-allowed" : ""}`}
              checked={isSelected}
              onChange={() => onPointToggle(point)}
              disabled={!canSelect}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-purple-600">
                  {point.code}
                </span>
              </div>
              <p className="text-sm text-gray-700">{point.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function FormCurriculumPointSelectionModal({
  enlarge,
  setEnlarge,
  fetchedContent,
  selectedCurriculumPoint,
  setSelectedCurriculumPoint,
  name,
  setValue,
}) {
  const modalRef = useRef(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [currentView, setCurrentView] = useState("suggested"); // "suggested" or "all"
  const maxSelections = 3;

  const curriculumPoints = useMemo(() => {
    return fetchedContent?.points
      ? Object.values(fetchedContent.points) || []
      : [];
  }, [fetchedContent?.points]);

  const suggestedPoints = useMemo(() => {
    return fetchedContent?.suggested || [];
  }, [fetchedContent?.suggested]);

  useEffect(() => {
    if (suggestedPoints.length > 0) setCurrentView("suggested");
    else setCurrentView("all");
  }, [suggestedPoints]);

  useEffect(() => {
    if (selectedCurriculumPoint && selectedCurriculumPoint.length > 0) {
      setSelectedPoints(selectedCurriculumPoint);
    }
  }, [selectedCurriculumPoint]);

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) newSet.delete(nodeId);
      else newSet.add(nodeId);
      return newSet;
    });
  };

  const handlePointToggle = (point) => {
    setSelectedPoints((prev) => {
      const isAlreadySelected = prev.some((p) => p.point_id === point.point_id);
      if (isAlreadySelected) {
        return prev.filter((p) => p.point_id !== point.point_id);
      } else {
        if (prev.length < maxSelections) {
          return [...prev, point];
        }
        return prev;
      }
    });
  };

  const handleConfirm = () => {
    setSelectedCurriculumPoint(selectedPoints);
    setValue(name, selectedPoints);
    setEnlarge(false);
  };

  const handleCancel = () => {
    setEnlarge(false);
  };

  if (!enlarge) return null;

  return (
    <div className="fixed inset-0 w-full h-full md:bg-opacity-30 md:bg-gray-800 flex overflow-y-auto justify-center items-center z-50">
      <div
        ref={modalRef}
        className="md:m-8 h-full w-full lg:w-[60vw] lg:h-[80vh] md:min-w-[700px] md:max-w-[900px] md:w-[75vw] md:h-[75vh] md:max-h-[600px] md:min-h-[400px] bg-white rounded-xl flex flex-col relative"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-purple-600 rounded-t-xl flex flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-white text-[17px] font-bold">
              Select Curriculum Points (Max {maxSelections})
            </p>
            <span className="text-purple-200 text-sm">
              {selectedPoints.length}/{maxSelections} selected
            </span>
          </div>
          <button onClick={handleCancel}>
            <X className="h-[18px] w-[18px] text-white cursor-pointer hover:text-gray-200" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 bg-gray-50 border-b flex gap-2">
          <button
            onClick={() => setCurrentView("suggested")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors 
              ${currentView === "suggested"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"}`}
          >
            <Star className="w-4 h-4" />
            Suggested Points ({suggestedPoints.length})
          </button>
          <button
            onClick={() => setCurrentView("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors 
              ${currentView === "all"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"}`}
          >
            <List className="w-4 h-4" />
            All Points
          </button>
        </div>

        {/* Content area */}
        <div className="flex flex-col w-full p-6 gap-4 overflow-y-auto flex-1">
          <p className="text-gray-600 text-sm">
            {currentView === "suggested"
              ? `Select up to ${maxSelections} suggested curriculum points that best match your topic.`
              : `Choose up to ${maxSelections} curriculum points for your presentation. Click the arrows to expand categories and select specific points.`}
          </p>

          {/* Selected items preview */}
          {selectedPoints.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-700 font-medium mb-2">
                Selected Points ({selectedPoints.length}/{maxSelections}):
              </p>
              <div className="space-y-2">
                {selectedPoints.map((point, index) => (
                  <div key={point.point_id} className="flex items-start gap-2">
                    <span className="text-xs text-purple-600 mt-1 font-medium">
                      {index + 1}.
                    </span>
                    <p className="text-sm text-purple-800">
                      {point.code
                        ? `${point.code}: ${point.description}`
                        : point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested vs All view */}
          {currentView === "suggested" ? (
            <div className="space-y-1">
              {suggestedPoints.length > 0 ? (
                <SuggestedPointsList
                  suggestedPoints={suggestedPoints}
                  selectedPoints={selectedPoints}
                  onPointToggle={handlePointToggle}
                  maxSelections={maxSelections}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No suggestions for entered topic
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    We couldn’t find curriculum points that closely match your
                    topic. You can manually choose from all available points or
                    try changing your topic.
                  </p>
                  <button
                    onClick={() => setCurrentView("all")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    <List className="w-4 h-4" />
                    Browse All Points
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {curriculumPoints.length > 0 ? (
                curriculumPoints.map((point) =>
                  point.map((item) => (
                    <TreeNode
                      key={item.point_id}
                      item={item}
                      depth={0}
                      selectedPoints={selectedPoints}
                      onPointToggle={handlePointToggle}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                      maxSelections={maxSelections}
                    />
                  ))
                )
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No curriculum data available
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end space-x-4 rounded-b-xl">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedPoints.length === 0}
            className={`px-4 py-2 rounded-md font-semibold ${
              selectedPoints.length > 0
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirm Selection ({selectedPoints.length})
          </button>
        </div>
      </div>
    </div>
  );
}
