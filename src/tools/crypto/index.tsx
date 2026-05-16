import { lazy } from "react";
import { LockOutlined, NumberOutlined, NodeIndexOutlined } from "@ant-design/icons";
import { ToolDefinition } from "../types";

export const cryptoTools: ToolDefinition[] = [
  {
    id: "aes-crypto",
    name: "AES 加解密",
    description: "AES 加密/解密，支持多模式、密钥库管理、暴力破解",
    category: "crypto",
    icon: <LockOutlined />,
    path: "/crypto/aes",
    component: lazy(() => import("./AesCrypto")),
    keywords: ["aes", "encrypt", "decrypt", "crypto", "cipher"],
  },
  {
    id: "hashcode",
    name: "HashCode",
    description: "Java 风格字符串 hashCode 计算",
    category: "crypto",
    icon: <NumberOutlined />,
    path: "/crypto/hashcode",
    component: lazy(() => import("./HashCode")),
    keywords: ["hash", "hashcode", "java", "string"],
  },
  {
    id: "event-mapping",
    name: "打点配置生成",
    description: "基于 MD5 生成行为打点事件映射配置",
    category: "crypto",
    icon: <NodeIndexOutlined />,
    path: "/crypto/event-mapping",
    component: lazy(() => import("./EventMapping")),
    keywords: ["event", "mapping", "md5", "打点", "埋点"],
  },
];
