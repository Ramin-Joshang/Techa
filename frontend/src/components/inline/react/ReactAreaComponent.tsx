import React, { useEffect, useState, useRef } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import dynamic from "next/dynamic";
import MonacoEditorComponent from "./MonacoEditorComponent";
import { GetTemplateById } from "../../../api/handlers/InlineReactHandler";
import { TemplateDisplayDTO } from "../../../api/types/dtos/InlineReactDtos";
import TemplateDisplayComponent from "./TemplateDisplayComponent";

const initialScope = {
  React,
  dynamic,
  // other dependencies
};

declare const window: { [key: string]: any };

window["React"] = React;

interface ReactAreaComponentProps {
  tutorialId: number;
}

const ReactAreaComponent: React.FC<ReactAreaComponentProps> = ({
  tutorialId,
}) => {
  const [code, setCode] = useState<string>("");
  const [component, setComponent] = useState<TemplateDisplayDTO>();
  const [error, setError] = useState("Loading...");

  useEffect(() => {
    GetTemplateById(tutorialId).then((res) => {
      if (res.data.IsSuccess) {
        if (res.data.Data.TemplateType != 2) {
          setError("Snippet Not Found!");
        } else {
          setError("");
          setComponent(res.data.Data);
          setCode(res.data.Data.Script);
        }
      }
    });
  }, []);

  const setCodeHandler = (newCode: string) => {
    setCode(newCode);
  };
  if (error)
    return (
      <div className="h-full w-full text-white text-lg">Error :{error}</div>
    );
  return (
    component && (
      <LiveProvider scope={initialScope} code={code} noInline>
        <div
          className={`h-full p-3 max-h-3xl flex flex-col bg-[#141414] select-none`}
        >
          <div className="h-full w-full max-sm:w-full mx-auto flex flex-col overflow-clip text-white">
            <div className="flex max-lg:flex-col h-full w-full relative">
              <div className="w-full lg:w-[70%] max-lg:h-screen h-screen  flex-col">
                <MonacoEditorComponent code={code} setCode={setCodeHandler} />
              </div>
              <div className="w-[30%] h-full p-2 pr-4">
                <TemplateDisplayComponent
                  data={component as TemplateDisplayDTO}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-full text-white p-1.5">
          <LiveError />
        </div>
        <div className="w-screen max-h-screen h-screen relative block">
          <LivePreview />
        </div>
      </LiveProvider>
    )
  );
};

export default ReactAreaComponent;
