import { useState, useCallback } from "react";
import {
  Button,
  Space,
  Card,
  Splitter,
  Alert,
  Input,
  message,
} from "antd";
import {
  PlayCircleOutlined,
  CopyOutlined,
  ClearOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { generateConfig, formatOutput, getRealIpViaApi } from "../../../utils/config-generator";

const { TextArea } = Input;

const PLACEHOLDER = `应用名: MyApp
包名: com.example.myapp
假包名: com.example.my.app
官网域名: example.com
app域名: app.example.com
app备用域名: backup.example.com
后台配置:
  package_key: <package_key>
  sign_key: <sign_key>
  aes_key: <aes_key>
  aes_iv: <aes_iv>
中转服务器配置:
  aes_key: <aes_key>
  aes_iv: <aes_iv>
正式环境接口:
  - https://api.example.com/orderapi/    入口
  - https://api.example.com/objectquery/    安卓 H5
  - https://api.example.com/cdntempfiles/    静态资源`;

export default function ConfigGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [domain, setDomain] = useState("");
  const [resolvedIp, setResolvedIp] = useState("");
  const [dnsLoading, setDnsLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) {
      setError("请输入配置内容");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await generateConfig(input);
      if (result.success && result.data) {
        setOutput(formatOutput(result.data));
      } else {
        setError(result.error ?? "解析失败");
        setOutput("");
      }
    } finally {
      setLoading(false);
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
  }, []);

  const handleDnsResolve = useCallback(async () => {
    const host = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!host) {
      message.warning("请输入域名");
      return;
    }
    setDnsLoading(true);
    setResolvedIp("");
    try {
      const ip = await getRealIpViaApi(host);
      if (ip) {
        setResolvedIp(ip);
      } else {
        message.error("解析失败，未获取到 IP");
      }
    } finally {
      setDnsLoading(false);
    }
  }, [domain]);

  const handleCopyIp = useCallback(async () => {
    if (!resolvedIp) return;
    try {
      await navigator.clipboard.writeText(resolvedIp);
      message.success("已复制 IP");
    } catch {
      message.error("复制失败");
    }
  }, [resolvedIp]);

  return (
    <div style={{ height: "calc(100vh - 48px - 32px)", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 12 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleGenerate}
            loading={loading}
          >
            生成
          </Button>
          <Button
            icon={<CopyOutlined />}
            onClick={handleCopy}
            disabled={!output}
          >
            复制输出
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            清空
          </Button>
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

      <Splitter style={{ flex: 1, minHeight: 0 }}>
        <Splitter.Panel defaultSize="55%" min="30%">
          <Card
            size="small"
            title="输入配置文本"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
          >
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER}
              style={{
                height: "100%",
                resize: "none",
                border: "none",
                borderRadius: 0,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            />
          </Card>
        </Splitter.Panel>
        <Splitter.Panel min="25%">
          <Card
            size="small"
            title="生成结果 (key=value)"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
          >
            <TextArea
              value={output}
              readOnly
              placeholder="点击「生成」按钮后结果将显示在此处..."
              style={{
                height: "100%",
                resize: "none",
                border: "none",
                borderRadius: 0,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            />
          </Card>
        </Splitter.Panel>
      </Splitter>

      <Card size="small" title="域名解析" style={{ marginTop: 12 }}>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            prefix={<GlobalOutlined />}
            placeholder="输入域名，如 example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onPressEnter={handleDnsResolve}
          />
          <Button type="primary" onClick={handleDnsResolve} loading={dnsLoading}>
            解析
          </Button>
        </Space.Compact>
        {resolvedIp && (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <Input
              value={resolvedIp}
              readOnly
              style={{ fontFamily: "monospace" }}
            />
            <Button icon={<CopyOutlined />} onClick={handleCopyIp}>
              复制
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
