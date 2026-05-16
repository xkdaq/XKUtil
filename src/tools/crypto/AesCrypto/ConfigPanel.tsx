import { Select, Space } from "antd";
import type { AesMode, AesPadding, OutputFormat, KeyFormat, KeySize, AesConfig } from "../../../utils/crypto";

interface ConfigPanelProps {
  config: AesConfig;
  onChange: (config: AesConfig) => void;
}

const MODE_OPTIONS: { value: AesMode; label: string }[] = [
  { value: "CBC", label: "CBC" },
  { value: "ECB", label: "ECB" },
  { value: "CFB", label: "CFB" },
  { value: "OFB", label: "OFB" },
  { value: "CTR", label: "CTR" },
];

const PADDING_OPTIONS: { value: AesPadding; label: string }[] = [
  { value: "Pkcs7", label: "PKCS7" },
  { value: "ZeroPadding", label: "ZeroPadding" },
  { value: "NoPadding", label: "NoPadding" },
];

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "Base64", label: "Base64" },
  { value: "Hex", label: "Hex" },
];

const KEY_FORMAT_OPTIONS: { value: KeyFormat; label: string }[] = [
  { value: "UTF-8", label: "UTF-8" },
  { value: "Hex", label: "Hex" },
];

const KEY_SIZE_OPTIONS: { value: KeySize; label: string }[] = [
  { value: 128, label: "128 位" },
  { value: 192, label: "192 位" },
  { value: 256, label: "256 位" },
];

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  return (
    <Space wrap size="middle">
      <Space size={4}>
        <span>模式:</span>
        <Select
          value={config.mode}
          onChange={(mode) => onChange({ ...config, mode })}
          options={MODE_OPTIONS}
          style={{ width: 90 }}
          size="small"
        />
      </Space>
      <Space size={4}>
        <span>填充:</span>
        <Select
          value={config.padding}
          onChange={(padding) => onChange({ ...config, padding })}
          options={PADDING_OPTIONS}
          style={{ width: 120 }}
          size="small"
        />
      </Space>
      <Space size={4}>
        <span>输出:</span>
        <Select
          value={config.outputFormat}
          onChange={(outputFormat) => onChange({ ...config, outputFormat })}
          options={FORMAT_OPTIONS}
          style={{ width: 90 }}
          size="small"
        />
      </Space>
      <Space size={4}>
        <span>密钥格式:</span>
        <Select
          value={config.keyFormat}
          onChange={(keyFormat) => onChange({ ...config, keyFormat })}
          options={KEY_FORMAT_OPTIONS}
          style={{ width: 90 }}
          size="small"
        />
      </Space>
      <Space size={4}>
        <span>密钥长度:</span>
        <Select
          value={config.keySize}
          onChange={(keySize) => onChange({ ...config, keySize })}
          options={KEY_SIZE_OPTIONS}
          style={{ width: 90 }}
          size="small"
        />
      </Space>
    </Space>
  );
}
