import { useState, useCallback } from "react";
import {
  Button,
  Space,
  Alert,
  Splitter,
  Card,
  Typography,
  message,
} from "antd";
import {
  FolderOpenOutlined,
  CopyOutlined,
  DownloadOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { CodeEditor } from "../../../components/CodeEditor";
import { convertDocxToHtml } from "../../../utils/docx";

const { Text } = Typography;

export default function DocxToHtml() {
  const [htmlOutput, setHtmlOutput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSelectFile = useCallback(async () => {
    try {
      const filePath = await open({
        multiple: false,
        filters: [{ name: "Word 文档", extensions: ["docx"] }],
      });

      if (!filePath) return;

      setLoading(true);
      setError(null);
      setWarnings([]);

      const name = filePath.split(/[/\\]/).pop() ?? "unknown.docx";
      setFileName(name);

      const fileData = await readFile(filePath);
      const arrayBuffer = fileData.buffer.slice(
        fileData.byteOffset,
        fileData.byteOffset + fileData.byteLength
      );

      const result = await convertDocxToHtml(arrayBuffer);

      if (result.success) {
        setHtmlOutput(result.html ?? "");
        setImageCount(result.imageCount ?? 0);
        setWarnings(result.messages ?? []);
        setError(null);
      } else {
        setHtmlOutput("");
        setError(result.error ?? "转换失败");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "文件读取失败";
      setError(msg);
      setHtmlOutput("");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!htmlOutput) return;
    try {
      await navigator.clipboard.writeText(htmlOutput);
      message.success("已复制到剪贴板");
    } catch {
      message.error("复制失败");
    }
  }, [htmlOutput]);

  const handleDownload = useCallback(async () => {
    if (!htmlOutput) return;
    try {
      const defaultName = fileName
        ? fileName.replace(/\.docx$/i, ".html")
        : "output.html";
      const savePath = await save({
        defaultPath: defaultName,
        filters: [{ name: "HTML", extensions: ["html"] }],
      });
      if (!savePath) return;
      await writeTextFile(savePath, htmlOutput);
      message.success("文件已保存");
    } catch {
      message.error("保存失败");
    }
  }, [htmlOutput, fileName]);

  const handleClear = useCallback(() => {
    setHtmlOutput("");
    setFileName(null);
    setError(null);
    setWarnings([]);
    setImageCount(0);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 12 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<FolderOpenOutlined />}
            onClick={handleSelectFile}
            loading={loading}
          >
            选择文件
          </Button>
          <Button
            icon={<CopyOutlined />}
            onClick={handleCopy}
            disabled={!htmlOutput}
          >
            复制 HTML
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!htmlOutput}
          >
            下载 HTML
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            清空
          </Button>
          {fileName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              已加载: {fileName}
            </Text>
          )}
        </Space>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 8 }}
        />
      )}

      {imageCount > 0 && (
        <Alert
          type="warning"
          message={`转换完成，${imageCount} 个图片已忽略`}
          showIcon
          closable
          style={{ marginBottom: 8 }}
        />
      )}

      {warnings.length > 0 && (
        <Alert
          type="info"
          message={`转换警告: ${warnings.length} 条`}
          description={warnings.slice(0, 5).join("\n")}
          showIcon
          closable
          style={{ marginBottom: 8 }}
        />
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <Splitter>
            <Splitter.Panel defaultSize="50%" min="30%">
              <Card
                size="small"
                title="HTML 代码"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
              >
                <CodeEditor
                  value={htmlOutput}
                  language="html"
                  readOnly
                />
              </Card>
            </Splitter.Panel>
            <Splitter.Panel min="30%">
              <Card
                size="small"
                title="预览"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
              >
                <iframe
                  srcDoc={htmlOutput || "<p style='color:#999;text-align:center;margin-top:40px'>选择 Word 文件后预览</p>"}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "#fff",
                  }}
                  sandbox="allow-same-origin"
                  title="HTML 预览"
                />
              </Card>
            </Splitter.Panel>
          </Splitter>
      </div>
    </div>
  );
}
