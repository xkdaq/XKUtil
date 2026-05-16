import { useState, useCallback } from "react";
import {
  Button,
  Select,
  Splitter,
  Card,
  Alert,
  Input,
  message,
} from "antd";
import {
  TranslationOutlined,
  SwapOutlined,
  CopyOutlined,
  ClearOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTranslateStore, TranslateProvider } from "../../../store/useTranslateStore";
import { translate, LANGUAGES, PROVIDER_NAMES } from "../../../utils/translate";
import SettingsDrawer from "./SettingsDrawer";

const { TextArea } = Input;

const PROVIDER_OPTIONS = (
  Object.entries(PROVIDER_NAMES) as [TranslateProvider, string][]
).map(([value, label]) => ({ value, label }));

const SOURCE_LANG_OPTIONS = LANGUAGES.map((l) => ({ value: l.key, label: l.label }));
const TARGET_LANG_OPTIONS = LANGUAGES.filter((l) => l.key !== "auto").map((l) => ({
  value: l.key,
  label: l.label,
}));

export default function Translate() {
  const {
    activeProvider,
    sourceLang,
    targetLang,
    providers,
    setActiveProvider,
    setSourceLang,
    setTargetLang,
    swapLanguages,
  } = useTranslateStore();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleTranslate = useCallback(async () => {
    if (!input.trim()) {
      setError("请输入要翻译的文本");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await translate(activeProvider, {
        text: input,
        from: sourceLang,
        to: targetLang,
      }, providers);

      if (result.success) {
        setOutput(result.data ?? "");
      } else {
        setError(result.error ?? "翻译失败");
        setOutput("");
      }
    } finally {
      setLoading(false);
    }
  }, [input, activeProvider, sourceLang, targetLang, providers]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      message.success("已复制");
    } catch {
      message.error("复制失败");
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const handleSwap = useCallback(() => {
    if (sourceLang === "auto") return;
    swapLanguages();
    if (output) {
      setInput(output);
      setOutput(input);
    }
  }, [sourceLang, swapLanguages, input, output]);

  return (
    <div style={{ height: "calc(100vh - 48px - 32px)", display: "flex", flexDirection: "column" }}>
      {/* 工具栏 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Select
          value={activeProvider}
          onChange={setActiveProvider}
          options={PROVIDER_OPTIONS}
          style={{ width: 130 }}
        />
        <Button icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)}>
          配置
        </Button>
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          icon={<TranslationOutlined />}
          onClick={handleTranslate}
          loading={loading}
        >
          翻译
        </Button>
        <Button icon={<CopyOutlined />} onClick={handleCopy} disabled={!output}>
          复制
        </Button>
        <Button icon={<ClearOutlined />} onClick={handleClear}>
          清空
        </Button>
      </div>

      {/* 语言栏 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Select
          value={sourceLang}
          onChange={setSourceLang}
          options={SOURCE_LANG_OPTIONS}
          style={{ width: 140 }}
        />
        <Button
          type="text"
          icon={<SwapOutlined />}
          onClick={handleSwap}
          disabled={sourceLang === "auto"}
        />
        <Select
          value={targetLang}
          onChange={setTargetLang}
          options={TARGET_LANG_OPTIONS}
          style={{ width: 140 }}
        />
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

      {/* 翻译区域 */}
      <Splitter style={{ flex: 1, minHeight: 0 }}>
        <Splitter.Panel defaultSize="50%" min="30%">
          <Card
            size="small"
            title="原文"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
          >
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入要翻译的文本..."
              style={{
                height: "100%",
                resize: "none",
                border: "none",
                borderRadius: 0,
                fontFamily: "monospace",
                fontSize: 14,
              }}
            />
          </Card>
        </Splitter.Panel>
        <Splitter.Panel min="30%">
          <Card
            size="small"
            title="译文"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
          >
            <TextArea
              value={output}
              readOnly
              placeholder="翻译结果将显示在此处..."
              style={{
                height: "100%",
                resize: "none",
                border: "none",
                borderRadius: 0,
                fontFamily: "monospace",
                fontSize: 14,
              }}
            />
          </Card>
        </Splitter.Panel>
      </Splitter>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
