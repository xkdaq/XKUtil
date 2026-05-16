import { lazy } from "react";
import { FileTextOutlined } from "@ant-design/icons";
import { ToolDefinition } from "../types";

export const textTools: ToolDefinition[] = [
  {
    id: "config-generator",
    name: "配置生成器",
    description: "从结构化文本解析生成 key=value 配置",
    category: "text",
    icon: <FileTextOutlined />,
    path: "/text/config-generator",
    component: lazy(() => import("./ConfigGenerator")),
    keywords: ["config", "generator", "parse", "配置", "生成"],
  },
];
