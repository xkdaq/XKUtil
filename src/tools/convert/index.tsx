import { lazy } from "react";
import { SwapOutlined } from "@ant-design/icons";
import { ToolDefinition } from "../types";

export const convertTools: ToolDefinition[] = [
  {
    id: "docx-to-html",
    name: "Word 转 HTML",
    description: "将 Word (.docx) 文档转换为 HTML",
    category: "convert",
    icon: <SwapOutlined />,
    path: "/convert/docx-to-html",
    component: lazy(() => import("./DocxToHtml")),
    keywords: ["word", "docx", "html", "convert", "转换", "文档"],
  },
];
