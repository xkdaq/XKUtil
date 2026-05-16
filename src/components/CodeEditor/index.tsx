import Editor, { OnMount } from "@monaco-editor/react";
import { theme } from "antd";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  placeholder?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
  height = "100%",
}: CodeEditorProps) {
  const { token } = theme.useToken();
  const isDark = token.colorBgContainer === "#141414";

  const handleMount: OnMount = (editor) => {
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      lineNumbers: "on",
      renderLineHighlight: "line",
      tabSize: 2,
      wordWrap: "on",
      automaticLayout: true,
    });
  };

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      theme={isDark ? "vs-dark" : "light"}
      onMount={handleMount}
      options={{
        readOnly,
        domReadOnly: readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        tabSize: 2,
        wordWrap: "on",
        automaticLayout: true,
      }}
    />
  );
}
