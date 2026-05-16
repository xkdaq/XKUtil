import { lazy } from "react";
import { CodeOutlined } from "@ant-design/icons";
import { ToolDefinition } from "../types";

export const jsonTools: ToolDefinition[] = [
  {
    id: "json-formatter",
    name: "JSON 格式化",
    description: "美化、压缩、验证 JSON 数据",
    category: "json",
    icon: <CodeOutlined />,
    path: "/json/formatter",
    component: lazy(() => import("./JsonFormatter")),
    keywords: ["json", "format", "beautify", "minify", "validate"],
  },
  {
    id: "json-tree",
    name: "JSON 树形视图",
    description: "以树形结构可视化展示 JSON 数据",
    category: "json",
    icon: <CodeOutlined />,
    path: "/json/tree",
    component: lazy(() => import("./JsonTreeView")),
    keywords: ["json", "tree", "view", "visualize"],
  },
];
