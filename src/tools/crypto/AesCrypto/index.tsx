import { useState, useCallback } from "react";
import {
  Button,
  Space,
  Card,
  Splitter,
  Alert,
  Input,
  Modal,
  Form,
  message,
} from "antd";
import {
  LockOutlined,
  UnlockOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { ConfigPanel } from "./ConfigPanel";
import { KeyPanel } from "./KeyPanel";
import { KeystoreDrawer } from "./KeystoreDrawer";
import { useKeyStore, type SavedKeyPair } from "../../../store/useKeyStore";
import {
  aesEncrypt,
  aesDecrypt,
  isValidDecryption,
  type AesConfig,
} from "../../../utils/crypto";

const { TextArea } = Input;

export default function AesCrypto() {
  const [config, setConfig] = useState<AesConfig>({
    mode: "CBC",
    padding: "Pkcs7",
    outputFormat: "Base64",
    keySize: 128,
  });
  const [keyValue, setKeyValue] = useState("");
  const [ivValue, setIvValue] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [keystoreOpen, setKeystoreOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [bruteForceInfo, setBruteForceInfo] = useState<string | null>(null);

  const keystoreKeys = useKeyStore((s) => s.keys);
  const addKey = useKeyStore((s) => s.addKey);

  const [saveForm] = Form.useForm();

  const handleEncrypt = useCallback(() => {
    if (!input.trim()) {
      setError("请输入需要加密的明文");
      return;
    }
    setError(null);
    setBruteForceInfo(null);
    const result = aesEncrypt(input, keyValue, ivValue, config);
    if (result.success) {
      setOutput(result.data!);
    } else {
      setError(result.error!);
      setOutput("");
    }
  }, [input, keyValue, ivValue, config]);

  const handleDecrypt = useCallback(() => {
    if (!input.trim()) {
      setError("请输入需要解密的密文");
      return;
    }
    setError(null);
    setBruteForceInfo(null);
    const result = aesDecrypt(input, keyValue, ivValue, config);
    if (result.success) {
      setOutput(result.data!);
    } else {
      setError(result.error!);
      setOutput("");
    }
  }, [input, keyValue, ivValue, config]);

  const handleBruteForce = useCallback(() => {
    if (!input.trim()) {
      setError("请输入需要解密的密文");
      return;
    }
    if (keystoreKeys.length === 0) {
      setError("密钥库为空，请先保存至少一个密钥对");
      return;
    }
    setError(null);
    setBruteForceInfo(null);

    for (const pair of keystoreKeys) {
      const tryConfig: AesConfig = { ...config, keySize: pair.keySize };
      const result = aesDecrypt(input, pair.key, pair.iv, tryConfig);
      if (result.success && result.data && isValidDecryption(result.data)) {
        setOutput(result.data);
        setBruteForceInfo(`匹配成功！使用密钥: "${pair.label}" (${pair.keySize}位)`);
        message.success(`暴力破解成功，匹配密钥: ${pair.label}`);
        return;
      }
    }

    setOutput("");
    setError(`暴力破解失败: 已尝试 ${keystoreKeys.length} 个密钥，均无法解密此密文`);
  }, [input, keystoreKeys, config]);

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
    setBruteForceInfo(null);
  }, []);

  const handleSaveKey = () => {
    saveForm.setFieldsValue({ label: "", key: keyValue, iv: ivValue });
    setSaveModalOpen(true);
  };

  const handleSaveConfirm = () => {
    saveForm.validateFields().then((values) => {
      addKey({
        label: values.label,
        key: values.key,
        iv: values.iv,
        keySize: config.keySize,
      });
      message.success("密钥对已保存");
      setSaveModalOpen(false);
    });
  };

  const handleLoadKey = (pair: SavedKeyPair) => {
    setKeyValue(pair.key);
    setIvValue(pair.iv);
    setConfig((c) => ({ ...c, keySize: pair.keySize }));
    message.success(`已加载密钥: ${pair.label}`);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 配置面板 */}
      <Card size="small">
        <ConfigPanel config={config} onChange={setConfig} />
      </Card>

      {/* 密钥面板 */}
      <Card size="small">
        <KeyPanel
          keyValue={keyValue}
          ivValue={ivValue}
          keySize={config.keySize}
          mode={config.mode}
          keystoreCount={keystoreKeys.length}
          onKeyChange={setKeyValue}
          onIvChange={setIvValue}
          onSave={handleSaveKey}
          onOpenKeystore={() => setKeystoreOpen(true)}
        />
      </Card>

      {/* 操作栏 */}
      <Space wrap>
        <Button type="primary" icon={<LockOutlined />} onClick={handleEncrypt}>
          加密
        </Button>
        <Button icon={<UnlockOutlined />} onClick={handleDecrypt}>
          解密
        </Button>
        <Button
          icon={<ThunderboltOutlined />}
          onClick={handleBruteForce}
          danger
        >
          暴力破解
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

      {/* 错误/信息提示 */}
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}
      {bruteForceInfo && (
        <Alert type="success" message={bruteForceInfo} showIcon closable />
      )}

      {/* 输入输出面板 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Splitter>
          <Splitter.Panel defaultSize="50%" min="30%">
            <Card
              size="small"
              title="输入"
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
              styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
            >
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入明文（加密时）或密文（解密时）..."
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
          <Splitter.Panel min="30%">
            <Card
              size="small"
              title="输出"
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
              styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
            >
              <TextArea
                value={output}
                readOnly
                placeholder="结果将显示在此处..."
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
      </div>

      {/* 密钥库抽屉 */}
      <KeystoreDrawer
        open={keystoreOpen}
        onClose={() => setKeystoreOpen(false)}
        onLoadKey={handleLoadKey}
      />

      {/* 保存密钥对 Modal */}
      <Modal
        title="保存密钥对"
        open={saveModalOpen}
        onOk={handleSaveConfirm}
        onCancel={() => setSaveModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={saveForm} layout="vertical">
          <Form.Item
            name="label"
            label="标签名称"
            rules={[{ required: true, message: "请输入标签名称" }]}
          >
            <Input placeholder="如: 生产环境、测试密钥..." />
          </Form.Item>
          <Form.Item
            name="key"
            label="密钥 (Hex)"
            rules={[{ required: true, message: "请输入密钥" }]}
          >
            <Input style={{ fontFamily: "monospace" }} />
          </Form.Item>
          <Form.Item name="iv" label="IV (Hex)">
            <Input style={{ fontFamily: "monospace" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
