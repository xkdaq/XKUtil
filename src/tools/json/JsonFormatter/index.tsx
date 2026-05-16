import { useState, useCallback } from "react";
import {
  Button,
  Space,
  Radio,
  Checkbox,
  Typography,
  Alert,
  Splitter,
  Card,
  Tooltip,
  message,
} from "antd";
import {
  FormatPainterOutlined,
  CompressOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  ClearOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { CodeEditor } from "../../../components/CodeEditor";
import {
  parseJson,
  formatJson,
  compressJson,
  getJsonStats,
} from "../../../utils/json";

const { Text } = Typography;

const SAMPLE_JSON = `{
  "name": "XKUtil",
  "version": "0.1.0",
  "description": "开发者工具箱",
  "features": ["JSON格式化", "编解码", "文本处理"],
  "config": {
    "theme": "light",
    "language": "zh-CN"
  }
}`;

type IndentType = 2 | 4 | "tab";

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<IndentType>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [stats, setStats] = useState<string>("");

  const handleBeautify = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      setStats("");
      return;
    }
    const result = parseJson(input);
    if (result.success) {
      const formatted = formatJson(result.data, indent, sortKeys);
      setOutput(formatted);
      setError(null);
      const s = getJsonStats(result.data);
      setStats(
        `类型: ${s.type} | 键数: ${s.keys} | 深度: ${s.depth} | 大小: ${s.size} 字节`
      );
    } else {
      setOutput("");
      setError(
        result.position
          ? `${result.message} (行 ${result.position.line}, 列 ${result.position.column})`
          : result.message
      );
      setStats("");
    }
  }, [input, indent, sortKeys]);

  const handleCompress = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    const result = parseJson(input);
    if (result.success) {
      setOutput(compressJson(result.data));
      setError(null);
      const s = getJsonStats(result.data);
      setStats(
        `类型: ${s.type} | 键数: ${s.keys} | 压缩后: ${compressJson(result.data).length} 字节`
      );
    } else {
      setOutput("");
      setError(
        result.position
          ? `${result.message} (行 ${result.position.line}, 列 ${result.position.column})`
          : result.message
      );
      setStats("");
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    if (!input.trim()) {
      setError(null);
      setOutput("");
      setStats("");
      return;
    }
    const result = parseJson(input);
    if (result.success) {
      setError(null);
      const s = getJsonStats(result.data);
      setOutput("Valid JSON");
      setStats(
        `类型: ${s.type} | 键数: ${s.keys} | 深度: ${s.depth} | 大小: ${s.size} 字节`
      );
      message.success("JSON 格式正确");
    } else {
      setOutput("");
      setError(
        result.position
          ? `${result.message} (行 ${result.position.line}, 列 ${result.position.column})`
          : result.message
      );
      setStats("");
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      message.success("已复制到剪贴板");
    } catch {
      message.error("复制失败");
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
    setStats("");
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      message.error("读取剪贴板失败");
    }
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 12 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<FormatPainterOutlined />}
            onClick={handleBeautify}
          >
            美化
          </Button>
          <Button icon={<CompressOutlined />} onClick={handleCompress}>
            压缩
          </Button>
          <Button icon={<CheckCircleOutlined />} onClick={handleValidate}>
            验证
          </Button>
          <Radio.Group
            value={indent}
            onChange={(e) => setIndent(e.target.value)}
            size="small"
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value={2}>2空格</Radio.Button>
            <Radio.Button value={4}>4空格</Radio.Button>
            <Radio.Button value="tab">Tab</Radio.Button>
          </Radio.Group>
          <Checkbox
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
          >
            排序Key
          </Checkbox>
          <Tooltip title="粘贴">
            <Button
              icon={<FileTextOutlined />}
              size="small"
              onClick={handlePaste}
            />
          </Tooltip>
          <Tooltip title="复制输出">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={handleCopy}
              disabled={!output}
            />
          </Tooltip>
          <Tooltip title="清空">
            <Button
              icon={<ClearOutlined />}
              size="small"
              onClick={handleClear}
            />
          </Tooltip>
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

      {stats && (
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {stats}
          </Text>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <Splitter>
          <Splitter.Panel defaultSize="50%" min="30%">
            <Card
              size="small"
              title="输入"
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
              styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
            >
              <CodeEditor value={input} onChange={setInput} language="json" />
            </Card>
          </Splitter.Panel>
          <Splitter.Panel min="30%">
            <Card
              size="small"
              title="输出"
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
              styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
            >
              <CodeEditor
                value={output}
                language={output === "Valid JSON" ? "text" : "json"}
                readOnly
              />
            </Card>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
