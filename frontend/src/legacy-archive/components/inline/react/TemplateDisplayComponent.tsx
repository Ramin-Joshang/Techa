import { TemplateDisplayDTO } from "../../../api/types/dtos/InlineReactDtos";
import React from "react";

interface TemplateDisplayProps {
  data: TemplateDisplayDTO;
}

const TemplateDisplayComponent: React.FC<TemplateDisplayProps> = ({ data }) => {
  return (
    <div className="py-4 px-6 w-full  max-h-screen overflow-auto bg-gray-900 shadow-md rounded-lg">
      {/* Main Template Info */}
      <div className="border-b border-gray-300 pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-200 mb-2">{data.Title}</h2>
        <p className="text-sm text-gray-400 mb-2">ID: {data.Id}</p>
        <p className="text-gray-300 mb-3">{data.Description}</p>
        <p className="text-sm text-gray-400">
          Content ID: {data.ContentId || "Null"}
        </p>
      </div>

      {/* Related Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">
          Related Templates
        </h3>
        {data.RelatedTemplates.length > 0 ? (
          <ul className="space-y-4">
            {data.RelatedTemplates.map((related, index) => (
              <li
                key={index}
                className="p-4 bg-white rounded-lg shadow border border-gray-800"
              >
                <h4 className="text-md font-bold text-gray-300 mb-1">
                  {related.ChildTitle}
                </h4>
                <p className="text-sm text-gray-400 mb-2">ID: {related.Id}</p>
                <p className="text-gray-300 mb-2">{related.ChildDescription}</p>
                <code className="block bg-gray-900 p-2 rounded text-gray-200 text-sm mb-2">
                  {related.ChildScript}
                </code>
                <p className="text-sm text-gray-400">
                  {related.ChildContentId !== undefined &&
                    `Content ID: ${related.ChildContentId}`}
                </p>
                <p className="text-sm text-gray-400">
                  {related.ChildTemplateType !== undefined &&
                    `Template Type: ${related.ChildTemplateType}`}
                </p>
                {related.ChildIsMain !== undefined && (
                  <span className="text-xs text-gray-500">
                    {related.ChildIsMain
                      ? "Main Template"
                      : "Secondary Template"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No related templates available.</p>
        )}
      </div>
    </div>
  );
};

export default TemplateDisplayComponent;
