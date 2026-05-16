import CryptoJS from "crypto-js";
import { fetch } from "@tauri-apps/plugin-http";
import { TranslateRequest, TranslateResult } from "../types";
import { getProviderLangCode } from "../languages";
import { TencentConfig } from "../../../store/useTranslateStore";

function getUTCDate(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toISOString().split("T")[0]!;
}

function sha256Hex(str: string): string {
  return CryptoJS.SHA256(str).toString();
}

function hmacSha256(key: CryptoJS.lib.WordArray | string, data: string): CryptoJS.lib.WordArray {
  return CryptoJS.HmacSHA256(data, key);
}

export async function tencentTranslate(
  request: TranslateRequest,
  config: TencentConfig
): Promise<TranslateResult> {
  if (!config.secretId || !config.secretKey) {
    return { success: false, error: "请先配置腾讯翻译 SecretId 和 SecretKey" };
  }

  const from = getProviderLangCode("tencent", request.from);
  const to = getProviderLangCode("tencent", request.to);
  const timestamp = Math.floor(Date.now() / 1000);
  const date = getUTCDate(timestamp);

  const payload = JSON.stringify({
    SourceText: request.text,
    Source: from,
    Target: to,
    ProjectId: 0,
  });

  // 1. 拼接规范请求串
  const httpRequestMethod = "POST";
  const canonicalUri = "/";
  const canonicalQueryString = "";
  const contentType = "application/json; charset=utf-8";
  const host = "tmt.tencentcloudapi.com";
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = "content-type;host";
  const hashedRequestPayload = sha256Hex(payload);

  const canonicalRequest = [
    httpRequestMethod,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedRequestPayload,
  ].join("\n");

  // 2. 拼接待签名字符串
  const credentialScope = `${date}/tmt/tc3_request`;
  const stringToSign = [
    "TC3-HMAC-SHA256",
    timestamp.toString(),
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  // 3. 计算签名 (派生密钥链)
  const secretDate = hmacSha256(CryptoJS.enc.Utf8.parse("TC3" + config.secretKey), date);
  const secretService = hmacSha256(secretDate, "tmt");
  const secretSigning = hmacSha256(secretService, "tc3_request");
  const signature = hmacSha256(secretSigning, stringToSign).toString();

  // 4. 拼接 Authorization
  const authorization = `TC3-HMAC-SHA256 Credential=${config.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers: Record<string, string> = {
    "Authorization": authorization,
    "Content-Type": contentType,
    "Host": host,
    "X-TC-Action": "TextTranslate",
    "X-TC-Version": "2018-03-21",
    "X-TC-Timestamp": timestamp.toString(),
    "X-TC-Region": "ap-guangzhou",
  };

  try {
    const response = await fetch("https://tmt.tencentcloudapi.com", {
      method: "POST",
      headers,
      body: payload,
    });

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: `响应解析失败: ${text.substring(0, 100)}` };
    }

    const resp = data.Response as Record<string, unknown> | undefined;
    if (resp?.Error) {
      const err = resp.Error as { Message: string; Code: string };
      return { success: false, error: `腾讯翻译错误: ${err.Message} (${err.Code})` };
    }

    return { success: true, data: (resp?.TargetText as string) ?? "" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: `请求失败: ${msg}` };
  }
}
