import * as Babel from "@babel/standalone";

/**
 * Modifies the component code to remove `render` and `export default` statements.
 * @param jsCode - The original JSX code.
 * @returns The modified JSX code.
 */
const modifyComponentCode = (jsCode: string): string => {
  return jsCode
    .replace(/render\(([^)]+)\)/g, "$1;")
    .replace(/export\s+default\s+([^;]+);?/g, "$1;");
};

export const compileAndRenderJSX = (jsCode: string): any => {
  try {
    const modifiedCode = modifyComponentCode(jsCode);
    const compiledCode = Babel.transform(modifiedCode, {
      presets: ["react"],
    }).code;


    // Evaluates the compiled code and returns the component
    if (compiledCode) {
      const CompiledComponent = eval(compiledCode);
      return CompiledComponent;
    }
  } catch (error) {
    console.error("Compilation Error:", error);
    return null;
  }
};
