import { ToolCategory, ToolDefinition } from "./types";
import { jsonTools } from "./json";
import { cryptoTools } from "./crypto";
import { textTools } from "./text";

const allTools: ToolDefinition[] = [...jsonTools, ...cryptoTools, ...textTools];

export function getToolCategories(): ToolCategory[] {
  const categoryMap = new Map<string, ToolCategory>();

  for (const tool of allTools) {
    if (!categoryMap.has(tool.category)) {
      categoryMap.set(tool.category, {
        id: tool.category,
        name: getCategoryName(tool.category),
        icon: tool.icon,
        tools: [],
      });
    }
    categoryMap.get(tool.category)!.tools.push(tool);
  }

  return Array.from(categoryMap.values());
}

export function getAllTools(): ToolDefinition[] {
  return allTools;
}

function getCategoryName(categoryId: string): string {
  const names: Record<string, string> = {
    json: "JSON 工具",
    encoding: "编解码",
    text: "文本处理",
    network: "网络工具",
    crypto: "加密工具",
  };
  return names[categoryId] ?? categoryId;
}
