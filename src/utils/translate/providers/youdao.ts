import CryptoJS from "crypto-js";
import { fetch } from "@tauri-apps/plugin-http";
import { TranslateRequest, TranslateResult } from "../types";
import { getProviderLangCode } from "../languages";
import { YoudaoConfig } from "../../../store/useTranslateStore";

function truncate(q: string): string {
  if (q.length <= 20) return q;
  return q.substring(0, 10) + q.length + q.substring(q.length - 10);
}

export async function youdaoTranslate(
  request: TranslateRequest,
  config: YoudaoConfig
): Promise<TranslateResult> {
  if (!config.appKey || !config.appSecret) {
    return { success: false, error: "请先配置有道翻译 AppKey 和密钥" };
  }

  const from = getProviderLangCode("youdao", request.from);
  const to = getProviderLangCode("youdao", request.to);
  const salt = crypto.randomUUID();
  const curtime = Math.floor(Date.now() / 1000).toString();
  const signStr = config.appKey + truncate(request.text) + salt + curtime + config.appSecret;
  const sign = CryptoJS.SHA256(signStr).toString();

  const params = new URLSearchParams({
    q: request.text,
    from,
    to,
    appKey: config.appKey,
    salt,
    sign,
    signType: "v3",
    curtime,
  });

  try {
    const response = await fetch("https://openapi.youdao.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: `响应解析失败: ${text.substring(0, 100)}` };
    }

    if (data.errorCode !== "0") {
      const code = String(data.errorCode);
      const msg = YOUDAO_ERRORS[code] ?? `错误码: ${code}`;
      return { success: false, error: msg };
    }

    const translated = (data.translation as string[])?.join("\n") ?? "";
    return { success: true, data: translated, detectedLang: (data.l as string)?.split("2")?.[0] };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: `请求失败: ${msg}` };
  }
}

const YOUDAO_ERRORS: Record<string, string> = {
  "101": "缺少必填参数",
  "102": "不支持的语言类型",
  "103": "翻译文本过长",
  "108": "应用账户余额不足",
  "110": "无相关服务的有效应用",
  "111": "开发者账号无效",
  "112": "请求服务无效",
  "113": "查询为空",
  "202": "签名检验失败",
  "203": "访问IP地址不在可访问IP列表",
  "401": "账户已欠费",
  "411": "访问频率受限",
};
