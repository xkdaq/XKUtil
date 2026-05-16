import { Input, Button, Space, Badge, Tooltip } from "antd";
import {
  ThunderboltOutlined,
  SaveOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import type { AesMode, KeyFormat, KeySize } from "../../../utils/crypto";
import { generateRandomKey, generateRandomIV } from "../../../utils/crypto";

interface KeyPanelProps {
  keyValue: string;
  ivValue: string;
  keySize: KeySize;
  keyFormat: KeyFormat;
  mode: AesMode;
  keystoreCount: number;
  onKeyChange: (key: string) => void;
  onIvChange: (iv: string) => void;
  onSave: () => void;
  onOpenKeystore: () => void;
}

export function KeyPanel({
  keyValue,
  ivValue,
  keySize,
  keyFormat,
  mode,
  keystoreCount,
  onKeyChange,
  onIvChange,
  onSave,
  onOpenKeystore,
}: KeyPanelProps) {
  const expectedKeyBytes = keySize / 8;
  const expectedKeyChars = keyFormat === "Hex" ? expectedKeyBytes * 2 : expectedKeyBytes;
  const expectedIVChars = keyFormat === "Hex" ? 32 : 16;

  const keyStatus =
    keyValue.length === 0
      ? undefined
      : keyValue.length === expectedKeyChars
        ? ("" as const)
        : ("error" as const);

  const ivStatus =
    mode === "ECB" || ivValue.length === 0
      ? undefined
      : ivValue.length === expectedIVChars
        ? ("" as const)
        : ("error" as const);

  const keyPlaceholder = keyFormat === "Hex"
    ? `Hex 格式, ${expectedKeyChars} 个字符`
    : `UTF-8 字符串, ${expectedKeyChars} 个字符`;

  const ivPlaceholder = keyFormat === "Hex"
    ? `Hex 格式, ${expectedIVChars} 个字符`
    : `UTF-8 字符串, ${expectedIVChars} 个字符`;

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Space.Compact style={{ width: "100%" }}>
        <Input
          addonBefore="Key"
          value={keyValue}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder={keyPlaceholder}
          status={keyStatus}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
        <Tooltip title="随机生成">
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => onKeyChange(generateRandomKey(keySize, keyFormat))}
          />
        </Tooltip>
      </Space.Compact>
      <Space.Compact style={{ width: "100%" }}>
        <Input
          addonBefore="IV"
          value={ivValue}
          onChange={(e) => onIvChange(e.target.value)}
          placeholder={ivPlaceholder}
          disabled={mode === "ECB"}
          status={ivStatus}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
        <Tooltip title="随机生成">
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => onIvChange(generateRandomIV(keyFormat))}
            disabled={mode === "ECB"}
          />
        </Tooltip>
      </Space.Compact>
      <Space>
        <Button size="small" icon={<SaveOutlined />} onClick={onSave}>
          保存密钥对
        </Button>
        <Badge count={keystoreCount} size="small">
          <Button
            size="small"
            icon={<DatabaseOutlined />}
            onClick={onOpenKeystore}
          >
            密钥库
          </Button>
        </Badge>
      </Space>
    </Space>
  );
}
