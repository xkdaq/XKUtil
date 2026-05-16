import { Input, Button, Space, Badge, Tooltip } from "antd";
import {
  ThunderboltOutlined,
  SaveOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import type { AesMode, KeySize } from "../../../utils/crypto";
import { generateRandomKey, generateRandomIV } from "../../../utils/crypto";

interface KeyPanelProps {
  keyValue: string;
  ivValue: string;
  keySize: KeySize;
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
  mode,
  keystoreCount,
  onKeyChange,
  onIvChange,
  onSave,
  onOpenKeystore,
}: KeyPanelProps) {
  const expectedKeyLen = (keySize / 8) * 2;
  const keyStatus =
    keyValue.length === 0
      ? undefined
      : keyValue.length === expectedKeyLen && /^[0-9a-fA-F]*$/.test(keyValue)
        ? ("" as const)
        : ("error" as const);

  const ivStatus =
    mode === "ECB" || ivValue.length === 0
      ? undefined
      : ivValue.length === 32 && /^[0-9a-fA-F]*$/.test(ivValue)
        ? ("" as const)
        : ("error" as const);

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Space.Compact style={{ width: "100%" }}>
        <Input
          addonBefore="Key"
          value={keyValue}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder={`Hex 格式, ${expectedKeyLen} 个字符`}
          status={keyStatus}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
        <Tooltip title="随机生成">
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => onKeyChange(generateRandomKey(keySize))}
          />
        </Tooltip>
      </Space.Compact>
      <Space.Compact style={{ width: "100%" }}>
        <Input
          addonBefore="IV"
          value={ivValue}
          onChange={(e) => onIvChange(e.target.value)}
          placeholder="Hex 格式, 32 个字符"
          disabled={mode === "ECB"}
          status={ivStatus}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
        <Tooltip title="随机生成">
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => onIvChange(generateRandomIV())}
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
