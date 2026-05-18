import { lazy } from "react";
import { BgColorsOutlined } from "@ant-design/icons";
import { ToolDefinition } from "../types";

export const colorTools: ToolDefinition[] = [
  {
    id: "color-picker",
    name: "取色器",
    description: "颜色选择器，支持十六进制 RGB 值和透明度，输出 #AARRGGBB 格式",
    category: "color",
    icon: <BgColorsOutlined />,
    path: "/color/picker",
    component: lazy(() => import("./ColorPicker")),
    keywords: ["color", "颜色", "取色", "hex", "rgb", "透明度", "alpha", "argb"],
  },
];
