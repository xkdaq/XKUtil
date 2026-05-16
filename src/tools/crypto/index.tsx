import { lazy } from "react";
import { LockOutlined } from "@ant-design/icons";
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
];
