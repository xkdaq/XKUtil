import { useState, useCallback } from "react";
import { Button, Input, Space, Card, message } from "antd";
import { CopyOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { TextArea } = Input;

/**
 * Java 风格的字符串 hashCode 算法
 * h = 31 * h + charCode，模拟 Java int 32位有符号溢出
 */
function javaHashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h = h | 0; // 转为 32 位有符号整数
  }
  return h;
}

export default function HashCode() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleGenerate = useCallback(() => {
    if (!input) {
      message.warning("请输入字符串");
      return;
    }
    const hash = javaHashCode(input);
    setResult(String(hash));
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      message.success("已复制");
    } catch {
      message.error("复制失败");
    }
  }, [result]);

  return (
    <div style={{ maxWidth: 700 }}>
      <Card size="small" title="Java String HashCode">
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入需要计算 hashCode 的字符串"
          autoSize={{ minRows: 3, maxRows: 8 }}
          style={{ fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}
        />
        <Space style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleGenerate}
          >
            计算
          </Button>
        </Space>
        {result && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Input
              value={result}
              readOnly
              addonBefore="hashCode"
              style={{ fontFamily: "monospace" }}
            />
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              复制
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
