"use client";
import React from "react";
import ReactAreaComponent from "../../react/ReactAreaComponent";

interface InlineReactViewProps {
  tutorialID: number;
  setVisibility: (isVisible: boolean) => void;
}

const InlineReactView: React.FC<InlineReactViewProps> = ({
  tutorialID,
  setVisibility,
}) => {
  return (
    <div className="relative bg-white rounded-lg shadow-lg p-6 mt-4 border border-gray-200">
      {/* Inline Content Header */}
      <h2 className="text-xl font-bold mb-4">React Tutorial {tutorialID}</h2>

      {/* Inline iframe for the interactive tutorial */}
      <ReactAreaComponent tutorialId={tutorialID} />

      {/* Reset Button to return to the initial view */}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => setVisibility(false)}
      >
        &times;
      </button>
    </div>
  );
};

export default InlineReactView;
