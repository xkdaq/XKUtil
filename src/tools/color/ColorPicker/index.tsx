import { useState, useCallback } from "react";
import { Card, Slider, Space, Input, Button, ColorPicker, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import type { AggregationColor } from "antd/es/color-picker/color";

/**
 * 将透明度百分比(0-100)转换为两位十六进制字符串
 */
function opacityToHex(opacity: number): string {
  const alpha = Math.round((opacity / 100) * 255);
  return alpha.toString(16).toUpperCase().padStart(2, "0");
}

export default function ColorPickerTool() {
  const [color, setColor] = useState<string>("FFFFFF");
  const [opacity, setOpacity] = useState<number>(100);

  const handleColorChange = useCallback((value: AggregationColor) => {
    const hex = value.toHexString();
    setColor(hex.replace("#", "").toUpperCase());
  }, []);

  const alphaHex = opacityToHex(opacity);
  const result = `#${alphaHex}${color}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result);
      message.success("已复制");
    } catch {
      message.error("复制失败");
    }
  }, [result]);

  const handleCopyRgb = useCallback(async () => {
    const hexOnly = `#${color}`;
    try {
      await navigator.clipboard.writeText(hexOnly);
      message.success("已复制");
    } catch {
      message.error("复制失败");
    }
  }, [color]);

  return (
    <div style={{ maxWidth: 700 }}>
      <Card size="small" title="取色器">
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* 颜色选择 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>选择颜色</div>
            <ColorPicker
              value={`#${color}`}
              onChange={handleColorChange}
              showText
              size="large"
              disabledAlpha
            />
          </div>

          {/* RGB 值 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Input
              value={`#${color}`}
              readOnly
              addonBefore="HEX"
              style={{ fontFamily: "monospace", flex: 1 }}
            />
            <Button icon={<CopyOutlined />} onClick={handleCopyRgb}>
              复制
            </Button>
          </div>

          {/* 透明度选择 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              透明度: {opacity}%（Alpha: 0x{alphaHex}）
            </div>
            <Slider
              min={0}
              max={100}
              step={10}
              value={opacity}
              onChange={setOpacity}
              marks={{
                0: "0%",
                10: "10%",
                20: "20%",
                30: "30%",
                40: "40%",
                50: "50%",
                60: "60%",
                70: "70%",
                80: "80%",
                90: "90%",
                100: "100%",
              }}
            />
          </div>

          {/* 带透明度的结果 #AARRGGBB */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Input
              value={result}
              readOnly
              addonBefore="#AARRGGBB"
              style={{ fontFamily: "monospace", flex: 1 }}
            />
            <Button type="primary" icon={<CopyOutlined />} onClick={handleCopy}>
              复制
            </Button>
          </div>

          {/* 颜色预览 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>颜色预览</div>
            <div
              style={{
                width: "100%",
                height: 60,
                borderRadius: 6,
                border: "1px solid #d9d9d9",
                background: `
                  linear-gradient(
                    rgba(${parseInt(color.slice(0, 2), 16)}, ${parseInt(color.slice(2, 4), 16)}, ${parseInt(color.slice(4, 6), 16)}, ${opacity / 100}),
                    rgba(${parseInt(color.slice(0, 2), 16)}, ${parseInt(color.slice(2, 4), 16)}, ${parseInt(color.slice(4, 6), 16)}, ${opacity / 100})
                  ),
                  repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 0 0 / 16px 16px
                `,
              }}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
}
