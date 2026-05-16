import { TranslateRequest, TranslateResult } from "./types";
import { TranslateProvider, ProviderConfigs } from "../../store/useTranslateStore";
import { baiduTranslate } from "./providers/baidu";
import { youdaoTranslate } from "./providers/youdao";
import { alibabaTranslate } from "./providers/alibaba";
import { tencentTranslate } from "./providers/tencent";

export type { TranslateRequest, TranslateResult } from "./types";
export { LANGUAGES, getProviderLangCode } from "./languages";

export async function translate(
  provider: TranslateProvider,
  request: TranslateRequest,
  configs: ProviderConfigs
): Promise<TranslateResult> {
  if (!request.text.trim()) {
    return { success: false, error: "请输入要翻译的文本" };
  }

  switch (provider) {
    case "baidu":
      return baiduTranslate(request, configs.baidu);
    case "youdao":
      return youdaoTranslate(request, configs.youdao);
    case "alibaba":
      return alibabaTranslate(request, configs.alibaba);
    case "tencent":
      return tencentTranslate(request, configs.tencent);
    default:
      return { success: false, error: "未知的翻译服务商" };
  }
}

export const PROVIDER_NAMES: Record<TranslateProvider, string> = {
  baidu: "百度翻译",
  youdao: "有道翻译",
  alibaba: "阿里翻译",
  tencent: "腾讯翻译",
};
