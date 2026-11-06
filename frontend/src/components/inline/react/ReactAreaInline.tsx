import React, { useEffect, useState, useRef } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import Draggable from "react-draggable";
import dynamic from "next/dynamic";
import MonacoEditorComponent from "./MonacoEditorComponent";
import { GetTemplateById } from "../../../api/handlers/InlineReactHandler";
import { useParams } from "next/navigation";
import { TemplateDisplayDTO } from "../../../api/types/dtos/InlineReactDtos";
import TemplateDisplayComponent from "./TemplateDisplayComponent";

const initialScope = {
  React,
  dynamic,
  // other dependencies
};

declare const window: { [key: string]: any };

window["React"] = React;

interface ReactAreaInlineProps {
  isPreview?: boolean;
}

const ReactAreaInline: React.FC<ReactAreaInlineProps> = ({ isPreview }) => {
  const [code, setCode] = useState<string>("");
  const [isDocked, setIsDocked] = useState<boolean>(false);
  const [component, setComponent] = useState<TemplateDisplayDTO>();
  const [error, setError] = useState("Loading...");
  const { reactId } = useParams();
  const dragRef = useRef<Draggable>(null);
  const tutorialId = reactId ? parseInt(reactId as string) : null;

  useEffect(() => {
    if (!tutorialId) return;
    GetTemplateById(tutorialId).then((res) => {
      if (res?.data?.IsSuccess) {
        if (res.data.Data?.TemplateType != 2) {
          setError("Snippet Not Found!");
        } else {
          setError("");
          setComponent(res.data.Data);
          setCode(res.data.Data.Script);
        }
      }
    }).catch(() => {
      setError("Failed to load template");
    });
  }, [tutorialId]);

  if (!reactId) return null;


  const setCodeHandler = (newCode: string) => {
    setCode(newCode);
  };
  return <div className="h-screen w-full">HI THERE</div>;
  if (error)
    return (
      <div className="h-full w-full text-white text-lg">Error :{error}</div>
    );
  return (
    <LiveProvider scope={initialScope} code={code} noInline>
      <Draggable
        disabled={!isDocked}
        ref={dragRef}
        handle=".drag-handle"
        defaultClassName={`${
          isDocked ? "absolute z-[49]" : "relative"
        } ${"p-3"} max-h-3xl flex flex-col bg-[#141414] select-none`}
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
      </Draggable>
      <div className="w-full h-full text-white p-1.5">
        <LiveError />
      </div>
      <div className="w-screen max-h-screen h-screen relative block">
        <LivePreview />
      </div>
    </LiveProvider>
  );
};

export default ReactAreaInline;
