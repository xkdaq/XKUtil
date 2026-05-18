# XKUtil - 开发者工具箱

一个基于 Tauri 2.x 构建的跨平台桌面应用，专为开发者设计，集成了多种常用开发工具，提升日常工作效率。

## 功能特性

XKUtil 目前包含以下工具模块：

### JSON 工具
- **JSON 格式化** — 美化、压缩、验证 JSON 数据，支持一键复制
- **JSON 树形视图** — 以层级树形结构可视化展示 JSON 数据，便于快速定位字段

### 加密工具
- **AES 加解密** — 支持多种模式（ECB/CBC 等），内置密钥库管理，附带暴力破解功能
- **HashCode** — 计算 Java 风格的字符串 hashCode 值
- **打点配置生成** — 基于 MD5 自动生成行为打点事件映射配置

### 文本处理
- **配置生成器** — 从结构化文本中解析并生成 `key=value` 格式的配置文件
- **翻译工具** — 多平台翻译聚合，支持百度、有道、阿里、腾讯等翻译引擎

### 格式转换
- **Word 转 HTML** — 将 `.docx` 文档一键转换为 HTML 格式

### 颜色工具
- **取色器** — 颜色选择与转换，支持十六进制、RGB 值及透明度调节，输出 `#AARRGGBB` 格式

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | [Tauri 2.x](https://tauri.app/) (Rust) |
| 前端框架 | [React 19](https://react.dev/) |
| 构建工具 | [Vite 6](https://vitejs.dev/) |
| 语言 | [TypeScript](https://www.typescriptlang.org/) |
| UI 组件库 | [Ant Design 5](https://ant.design/) |
| 状态管理 | [Zustand](https://github.com/pmndrs/zustand) |

## 开发环境

### 前置要求

- [Node.js](https://nodejs.org/) >= 20
- [Rust](https://www.rust-lang.org/tools/install) 最新稳定版
- 平台特定依赖（参考 [Tauri 官方文档](https://tauri.app/start/prerequisites/)）

### 本地运行

```bash
# 安装前端依赖
npm install

# 启动开发服务器（含 Tauri 桌面窗口）
npm run tauri dev
```

### 构建生产包

```bash
# 构建当前平台的安装包
npm run tauri build
```

构建产物将输出到 `src-tauri/target/release/bundle/` 目录下，包含 `.dmg` / `.app` / `.msi` / `.deb` 等格式。

## 项目结构

```
XKUtil/
├── src/                    # 前端源码 (React + TypeScript)
│   ├── tools/              # 各工具模块
│   │   ├── color/          # 颜色工具
│   │   ├── convert/        # 格式转换
│   │   ├── crypto/         # 加密工具
│   │   ├── json/           # JSON 工具
│   │   └── text/           # 文本处理
│   ├── components/         # 公共组件
│   ├── layouts/            # 布局组件
│   ├── store/              # Zustand 状态管理
│   └── utils/              # 工具函数
├── src-tauri/              # Tauri/Rust 后端
│   ├── src/                # Rust 源码
│   ├── icons/              # 应用图标
│   └── tauri.conf.json     # Tauri 配置
├── doc/                    # 文档与指南
└── package.json
```

## 版本历史

| 版本 | 说明 |
|------|------|
| v0.6.0 | 当前版本 |

## License

[MIT](LICENSE)
