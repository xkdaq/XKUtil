# XKUtil - 跨平台开发者工具箱架构方案

## Context

从零构建一个跨平台桌面开发者工具箱应用 "XKUtil"，提供 JSON 处理、编解码、文本处理、网络工具、加解密等常用开发工具。第一步实现 JSON 序列化工具（压缩、美化、验证、树形视图）。

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 桌面框架 | Tauri 2 (Rust 后端 + 系统 WebView) |
| 前端框架 | React 19 + TypeScript 5 |
| 构建工具 | Vite 6 |
| UI 组件库 | Ant Design 5 |
| 状态管理 | Zustand 5 |
| 代码编辑器 | @monaco-editor/react |
| 路由 | React Router 7 (Hash Router) |

## 项目结构

```
XKUtil/
├── src-tauri/                    # Rust 后端
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   └── icons/
│
├── src/                          # React 前端
│   ├── main.tsx                  # 入口
│   ├── App.tsx                   # 根组件
│   ├── routes.tsx                # 路由定义（从 registry 动态生成）
│   │
│   ├── layouts/
│   │   └── MainLayout.tsx        # 侧边栏 + 内容区布局
│   │
│   ├── components/               # 共享组件
│   │   ├── CodeEditor/
│   │   │   └── index.tsx         # Monaco 编辑器封装
│   │   └── CopyButton/
│   │       └── index.tsx
│   │
│   ├── tools/                    # 工具模块（核心插件系统）
│   │   ├── types.ts              # ToolDefinition 接口
│   │   ├── registry.ts           # 工具注册中心
│   │   └── json/                 # JSON 工具类别
│   │       ├── index.ts          # 类别注册导出
│   │       ├── JsonFormatter/
│   │       │   └── index.tsx     # 美化 + 压缩 + 验证（合为一体）
│   │       └── JsonTreeView/
│   │           └── index.tsx     # 树形视图
│   │
│   ├── store/
│   │   └── useAppStore.ts        # 全局状态（主题、侧边栏）
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── theme.ts             # Ant Design 主题配置
│   │
│   └── utils/
│       └── json.ts              # JSON 处理工具函数
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .eslintrc.cjs
```

## 核心架构设计

### 1. 工具注册系统 (Plugin Registry)

每个工具通过 `ToolDefinition` 接口注册，侧边栏和路由从注册中心自动生成：

```typescript
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: ReactNode;
  path: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  keywords?: string[];
}
```

添加新工具只需：
1. 在 `src/tools/{category}/` 下创建组件
2. 在该类别的 `index.ts` 中添加 ToolDefinition
3. 无需修改路由、侧边栏等全局代码

### 2. 布局结构

```
┌──────────────────────────────────────────────┐
│  Sidebar (from registry)  │  Content Area    │
│  ┌──────────────────┐     │  ┌────────────┐  │
│  │ JSON 工具        │     │  │ Tool Page  │  │
│  │  - 格式化/压缩   │     │  │ (Lazy)     │  │
│  │  - 树形视图      │     │  │            │  │
│  │ 编码工具         │     │  │            │  │
│  │ 文本工具         │     │  │            │  │
│  │ ...             │     │  │            │  │
│  └──────────────────┘     │  └────────────┘  │
└──────────────────────────────────────────────┘
```

### 3. 状态管理

- **全局状态** (Zustand)：主题、侧边栏折叠状态
- **工具状态**：组件内 useState，保持简单
- 无需 Redux 级别的复杂度

### 4. 前后端分工

- **前端 JS**：JSON 解析/格式化、Base64、URL 编解码、正则测试等轻量计算
- **Rust 后端**：文件读写、原生对话框、系统剪贴板、大文件处理、重度加密运算

## 第一步实现：JSON 格式化工具

### 功能范围

将美化、压缩、验证合为一个页面 `JsonFormatter`，通过按钮/选项切换操作模式：

- **美化 (Beautify)**：格式化 JSON，可选缩进量 (2/4/Tab)
- **压缩 (Minify)**：移除所有空白
- **验证 (Validate)**：检查是否有效 JSON，显示错误位置
- **选项**：递归排序 Key

### UI 设计

```
┌─────────────────────────────────────────────────┐
│  JSON 格式化工具                                 │
├───────────────────────┬─────────────────────────┤
│  Input (Monaco)       │  Output (Monaco, 只读)   │
│                       │                         │
│                       │                         │
├───────────────────────┴─────────────────────────┤
│  [美化] [压缩] [验证]  缩进:[2][4][Tab]         │
│  [□ 排序Key] [复制输出] [清空] [打开文件]        │
└─────────────────────────────────────────────────┘
```

### 实现步骤

1. **项目初始化**：`npm create tauri-app@latest` + 安装依赖
2. **基础框架搭建**：MainLayout、路由系统、工具注册中心
3. **共享组件**：CodeEditor (Monaco 封装)
4. **JSON 工具实现**：JsonFormatter 组件 + json.ts 工具函数
5. **JSON 树形视图**：基于 Ant Design Tree 的交互式展示

### 关键文件

| 文件 | 用途 |
|------|------|
| `src/tools/types.ts` | 工具接口定义 |
| `src/tools/registry.ts` | 注册中心，驱动侧边栏和路由 |
| `src/layouts/MainLayout.tsx` | 应用主布局 |
| `src/tools/json/JsonFormatter/index.tsx` | JSON 格式化工具主体 |
| `src/components/CodeEditor/index.tsx` | Monaco 编辑器封装 |
| `src/utils/json.ts` | JSON 处理函数 |

## 验证方式

1. `npm run tauri dev` 启动应用，确认窗口正常打开
2. 在 JSON 格式化工具中输入无效 JSON，验证错误提示
3. 输入有效 JSON，点击美化/压缩，确认输出正确
4. 测试复制、清空、打开文件功能
5. 确认侧边栏导航正常工作
6. `npm run lint` 确保代码规范
