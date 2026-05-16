import { useState, useCallback } from "react";
import { Button, Input, Space, Card, InputNumber, message } from "antd";
import { CopyOutlined, ThunderboltOutlined } from "@ant-design/icons";
import CryptoJS from "crypto-js";

const { TextArea } = Input;

const DEFAULT_WORDS = [
  "modular", "page", "start_time", "end_time", "duration", "package_id",
  "leave_by", "product_id", "product_term", "product_rate", "product_position",
  "product_num", "action_cnt", "package_type", "extra", "repaymane_test",
  "amount_selection", "default_select_num", "final_select_num", "product_cnt",
  "cancel_product_cnt", "permission_types_apply", "permission_types_fail",
  "repay_type", "expiry_date", "apply_amount", "fee_amount",
  "is_click_repay_detail", "is_click_loan_info", "loan_info", "base_info",
  "emergency_contact", "biometric", "idcard", "first_bankcard", "add_bankcard",
  "question", "balance", "is_click", "is_confirm", "apply_amt", "expiry_amt",
];

function generateMapping(index: number, prefix: string, packageKeys: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const word of DEFAULT_WORDS) {
    const combined = packageKeys + word;
    const md5Hash = CryptoJS.MD5(combined).toString();
    const truncated = md5Hash.slice(-index);
    result[word] = prefix + truncated;
  }
  return result;
}

export default function EventMapping() {
  const [index, setIndex] = useState<number>(8);
  const [prefix, setPrefix] = useState("");
  const [packageKeys, setPackageKeys] = useState("");
  const [output, setOutput] = useState("");

  const handleGenerate = useCallback(() => {
    if (!packageKeys.trim()) {
      message.warning("请输入 package_keys");
      return;
    }
    if (index < 1 || index > 32) {
      message.warning("截取位数应在 1-32 之间");
      return;
    }
    const mapping = generateMapping(index, prefix, packageKeys.trim());
    setOutput(JSON.stringify(mapping, null, 2));
  }, [index, prefix, packageKeys]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      message.success("已复制");
    } catch {
      message.error("复制失败");
    }
  }, [output]);

  return (
    <div style={{ height: "calc(100vh - 48px - 32px)", display: "flex", flexDirection: "column" }}>
      <Card size="small" title="行为打点配置生成" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Space wrap>
            <span>package_keys:</span>
            <Input
              value={packageKeys}
              onChange={(e) => setPackageKeys(e.target.value)}
              placeholder="输入 package_keys"
              style={{ width: 240 }}
            />
            <span>前缀:</span>
            <Input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="如 ev_"
              style={{ width: 120 }}
            />
            <span>截取位数:</span>
            <InputNumber
              min={1}
              max={32}
              value={index}
              onChange={(v) => setIndex(v ?? 8)}
              style={{ width: 80 }}
            />
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleGenerate}
            >
              生成
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopy}
              disabled={!output}
            >
              复制结果
            </Button>
          </Space>
        </div>
      </Card>

      <Card
        size="small"
        title={`生成结果${output ? ` (${DEFAULT_WORDS.length} 项)` : ""}`}
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
        styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
      >
        <TextArea
          value={output}
          readOnly
          placeholder="点击「生成」后结果将显示在此处..."
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
    </div>
  );
}
