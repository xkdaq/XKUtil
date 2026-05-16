import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TranslateProvider = "baidu" | "youdao" | "alibaba" | "tencent";

export interface BaiduConfig {
  appId: string;
  secretKey: string;
}

export interface YoudaoConfig {
  appKey: string;
  appSecret: string;
}

export interface AlibabaConfig {
  accessKeyId: string;
  accessKeySecret: string;
}

export interface TencentConfig {
  secretId: string;
  secretKey: string;
}

export interface ProviderConfigs {
  baidu: BaiduConfig;
  youdao: YoudaoConfig;
  alibaba: AlibabaConfig;
  tencent: TencentConfig;
}

interface TranslateState {
  providers: ProviderConfigs;
  activeProvider: TranslateProvider;
  sourceLang: string;
  targetLang: string;
  setProviderConfig: <T extends TranslateProvider>(
    provider: T,
    config: ProviderConfigs[T]
  ) => void;
  setActiveProvider: (provider: TranslateProvider) => void;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  swapLanguages: () => void;
}

export const useTranslateStore = create<TranslateState>()(
  persist(
    (set) => ({
      providers: {
        baidu: { appId: "", secretKey: "" },
        youdao: { appKey: "", appSecret: "" },
        alibaba: { accessKeyId: "", accessKeySecret: "" },
        tencent: { secretId: "", secretKey: "" },
      },
      activeProvider: "baidu",
      sourceLang: "auto",
      targetLang: "en",
      setProviderConfig: (provider, config) =>
        set((state) => ({
          providers: { ...state.providers, [provider]: config },
        })),
      setActiveProvider: (provider) => set({ activeProvider: provider }),
      setSourceLang: (lang) => set({ sourceLang: lang }),
      setTargetLang: (lang) => set({ targetLang: lang }),
      swapLanguages: () =>
        set((state) => {
          if (state.sourceLang === "auto") return state;
          return {
            sourceLang: state.targetLang,
            targetLang: state.sourceLang,
          };
        }),
    }),
    { name: "xkutil-translate" }
  )
);
