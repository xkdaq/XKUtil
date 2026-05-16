export interface Language {
  key: string;
  label: string;
}

export const LANGUAGES: Language[] = [
  { key: "auto", label: "自动检测" },
  { key: "zh", label: "中文" },
  { key: "en", label: "英语" },
  { key: "th", label: "泰语" },
  { key: "id", label: "印尼语" },
  { key: "es", label: "西班牙语" },
  { key: "vi", label: "越南语" },
  { key: "my", label: "缅甸语" },
];

// 各平台语言代码映射
const LANG_MAP: Record<string, Record<string, string>> = {
  baidu: {
    auto: "auto", zh: "zh", en: "en", th: "th",
    id: "id", es: "spa", vi: "vie", my: "bur",
  },
  youdao: {
    auto: "auto", zh: "zh-CHS", en: "en", th: "th",
    id: "id", es: "es", vi: "vi", my: "my",
  },
  alibaba: {
    auto: "auto", zh: "zh", en: "en", th: "th",
    id: "id", es: "es", vi: "vi", my: "my",
  },
  tencent: {
    auto: "auto", zh: "zh", en: "en", th: "th",
    id: "id", es: "es", vi: "vi", my: "my",
  },
};

// 百度翻译标准版/高级版不支持的语言（需尊享版）
export const BAIDU_UNSUPPORTED_STANDARD: string[] = ["id", "my"];

export function getProviderLangCode(provider: string, key: string): string {
  return LANG_MAP[provider]?.[key] ?? key;
}
