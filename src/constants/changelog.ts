export const APP_VERSION = "0.2.0";

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.2.0",
    date: "2026-05-16",
    changes: [
      "新增 AES 加解密工具",
      "支持 ECB/CBC/CFB/OFB/CTR 模式",
      "支持 PKCS7/ZeroPadding/NoPadding 填充",
      "支持 Base64/Hex 输出格式",
      "密钥库管理（保存、编辑、删除密钥对）",
      "暴力破解功能（遍历密钥库尝试解密）",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-15",
    changes: [
      "初始版本发布",
      "JSON 格式化工具（美化、压缩、验证）",
      "JSON 树形视图",
      "支持亮色/暗色主题切换",
      "主题设置持久化保存",
    ],
  },
];
