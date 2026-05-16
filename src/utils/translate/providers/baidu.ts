import CryptoJS from "crypto-js";
import { fetch } from "@tauri-apps/plugin-http";
import { TranslateRequest, TranslateResult } from "../types";
import { getProviderLangCode, BAIDU_UNSUPPORTED_STANDARD } from "../languages";
import { BaiduConfig } from "../../../store/useTranslateStore";

export async function baiduTranslate(
  request: TranslateRequest,
  config: BaiduConfig
): Promise<TranslateResult> {
  if (!config.appId || !config.secretKey) {
    return { success: false, error: "请先配置百度翻译 AppID 和密钥" };
  }

  // 检查目标语言是否在百度标准版/高级版支持范围内
  if (BAIDU_UNSUPPORTED_STANDARD.includes(request.to)) {
    const langLabel = request.to === "id" ? "印尼语" : "缅甸语";
    return {
      success: false,
      error: `百度翻译标准版/高级版不支持${langLabel}，请升级到尊享版或使用其他翻译服务（有道/阿里/腾讯）`,
    };
  }

  const from = getProviderLangCode("baidu", request.from);
  const to = getProviderLangCode("baidu", request.to);
  const salt = Date.now().toString();
  const sign = CryptoJS.MD5(config.appId + request.text + salt + config.secretKey).toString();

  const params = new URLSearchParams({
    q: request.text,
    from,
    to,
    appid: config.appId,
    salt,
    sign,
  });

  try {
    const url = `https://fanyi-api.baidu.com/api/trans/vip/translate?${params.toString()}`;
    const response = await fetch(url, { method: "GET" });

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: `响应解析失败: ${text.substring(0, 100)}` };
    }

    if (data.error_code) {
      const code = String(data.error_code);
      const msg = BAIDU_ERRORS[code] ?? `错误码: ${code} - ${data.error_msg ?? ""}`;
      return { success: false, error: msg };
    }

    const transResult = data.trans_result as Array<{ dst: string }> | undefined;
    const translated = transResult?.map((item) => item.dst).join("\n") ?? "";

    return { success: true, data: translated, detectedLang: data.from as string };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: `请求失败: ${msg}` };
  }
}

const BAIDU_ERRORS: Record<string, string> = {
  "52001": "请求超时，请重试",
  "52002": "系统错误，请重试",
  "52003": "未授权用户，请检查 AppID",
  "54001": "签名错误，请检查密钥",
  "54003": "访问频率受限，请稍后重试",
  "54004": "账户余额不足",
  "54005": "长query请求频繁，请稍后重试",
  "58000": "客户端IP非法",
  "58001": "译文语言方向不支持，标准版/高级版仅支持28种常见语言，请升级到尊享版或换用其他翻译服务",
  "58002": "服务当前已关闭",
  "90107": "认证未通过或未生效",
};
