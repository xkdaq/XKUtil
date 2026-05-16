import { lazy } from "react";
import { FileTextOutlined, TranslationOutlined } from "@ant-design/icons";
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
  {
    id: "translate",
    name: "翻译工具",
    description: "多平台翻译工具，支持百度/有道/阿里/腾讯翻译",
    category: "text",
    icon: <TranslationOutlined />,
    path: "/text/translate",
    component: lazy(() => import("./Translate")),
    keywords: ["translate", "翻译", "百度", "有道", "阿里", "腾讯"],
  },
];
