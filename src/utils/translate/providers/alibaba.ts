import CryptoJS from "crypto-js";
import { fetch } from "@tauri-apps/plugin-http";
import { TranslateRequest, TranslateResult } from "../types";
import { getProviderLangCode } from "../languages";
import { AlibabaConfig } from "../../../store/useTranslateStore";

export async function alibabaTranslate(
  request: TranslateRequest,
  config: AlibabaConfig
): Promise<TranslateResult> {
  if (!config.accessKeyId || !config.accessKeySecret) {
    return { success: false, error: "请先配置阿里翻译 AccessKeyId 和 AccessKeySecret" };
  }

  const from = getProviderLangCode("alibaba", request.from);
  const to = getProviderLangCode("alibaba", request.to);

  const body = JSON.stringify({
    FormatType: "text",
    SourceLanguage: from,
    TargetLanguage: to,
    SourceText: request.text,
    Scene: "general",
  });

  const date = new Date().toUTCString();
  const nonce = crypto.randomUUID();
  const contentMd5 = CryptoJS.MD5(CryptoJS.enc.Utf8.parse(body)).toString(CryptoJS.enc.Base64);

  // ROA 签名
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json;charset=utf-8",
    "Content-MD5": contentMd5,
    "Date": date,
    "x-acs-signature-nonce": nonce,
    "x-acs-signature-method": "HMAC-SHA1",
    "x-acs-version": "2018-10-12",
  };

  // 构建签名字符串
  const canonicalHeaders = Object.keys(headers)
    .filter((k) => k.startsWith("x-acs-"))
    .sort()
    .map((k) => `${k}:${headers[k]}`)
    .join("\n");

  const resource = "/api/translate/web/general";
  const stringToSign = [
    "POST",
    "application/json",
    contentMd5,
    "application/json;charset=utf-8",
    date,
    canonicalHeaders,
    resource,
  ].join("\n");

  const signature = CryptoJS.HmacSHA1(stringToSign, config.accessKeySecret).toString(
    CryptoJS.enc.Base64
  );

  headers["Authorization"] = `acs ${config.accessKeyId}:${signature}`;

  try {
    const response = await fetch(
      "https://mt.cn-hangzhou.aliyuncs.com/api/translate/web/general",
      { method: "POST", headers, body }
    );

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: `响应解析失败: ${text.substring(0, 100)}` };
    }

    if (data.Code !== "200" && data.Code !== 200) {
      return { success: false, error: (data.Message as string) ?? `阿里翻译错误: ${data.Code}` };
    }

    const d = data.Data as Record<string, string> | undefined;
    return { success: true, data: d?.Translated ?? "" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: `请求失败: ${msg}` };
  }
}
