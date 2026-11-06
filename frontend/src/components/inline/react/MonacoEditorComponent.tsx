"use client";
import { Monaco, Editor as MonacoEditor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { configureMonacoTailwindcss } from "monaco-tailwindcss";

interface MonacoEditorComponentProps {
  code: string;
  setCode: (code: string) => void;
}

const MonacoEditorComponent: React.FC<MonacoEditorComponentProps> = ({
  code,
  setCode,
}) => {
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const onMountTailwindInject = (monaco: any) => {
    try {
      if (typeof window !== "undefined") {
        configureMonacoTailwindcss(monaco);
      }
    } catch (err) {
      console.warn("Failed to initialize tailwindcss for monaco", err);
    }
  };

  return (
    <div className="w-full relative block h-full">
      <MonacoEditor
        value={code}
        options={{
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          inlineSuggest: {
            enabled: true,
          },
          contextmenu: true,
        }}
        onChange={(e) => {
          setCode(e as string);
        }}
        beforeMount={onMountTailwindInject}
        language="javascript"
        defaultLanguage="javascript"
        theme="vs-dark"
        className="h-full"
      />
    </div>
  );
};

export default MonacoEditorComponent;
