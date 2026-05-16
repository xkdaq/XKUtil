import { ReactNode, LazyExoticComponent, ComponentType } from "react";

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: ReactNode;
  path: string;
  component: LazyExoticComponent<ComponentType>;
  keywords?: string[];
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: ReactNode;
  tools: ToolDefinition[];
}
