import CryptoJS from "crypto-js";

export type AesMode = "ECB" | "CBC" | "CFB" | "OFB" | "CTR";
export type AesPadding = "Pkcs7" | "ZeroPadding" | "NoPadding";
export type OutputFormat = "Base64" | "Hex";
export type KeySize = 128 | 192 | 256;

export interface AesConfig {
  mode: AesMode;
  padding: AesPadding;
  outputFormat: OutputFormat;
  keySize: KeySize;
}

export interface AesResult {
  success: boolean;
  data?: string;
  error?: string;
}

const MODE_MAP: Record<AesMode, typeof CryptoJS.mode.CBC> = {
  ECB: CryptoJS.mode.ECB,
  CBC: CryptoJS.mode.CBC,
  CFB: CryptoJS.mode.CFB,
  OFB: CryptoJS.mode.OFB,
  CTR: CryptoJS.mode.CTR,
};

const PADDING_MAP: Record<AesPadding, typeof CryptoJS.pad.Pkcs7> = {
  Pkcs7: CryptoJS.pad.Pkcs7,
  ZeroPadding: CryptoJS.pad.ZeroPadding,
  NoPadding: CryptoJS.pad.NoPadding,
};

export function aesEncrypt(
  plaintext: string,
  key: string,
  iv: string,
  config: AesConfig
): AesResult {
  try {
    const keyBytes = CryptoJS.enc.Hex.parse(key);
    const expectedKeyLen = config.keySize / 8;
    if (keyBytes.sigBytes !== expectedKeyLen) {
      return {
        success: false,
        error: `密钥长度错误: 期望 ${expectedKeyLen * 2} 个十六进制字符 (${config.keySize} 位), 实际 ${key.length} 个字符`,
      };
    }

    const options: Record<string, unknown> = {
      mode: MODE_MAP[config.mode],
      padding: PADDING_MAP[config.padding],
    };

    if (config.mode !== "ECB") {
      const ivBytes = CryptoJS.enc.Hex.parse(iv);
      if (ivBytes.sigBytes !== 16) {
        return {
          success: false,
          error: `IV 长度错误: 期望 32 个十六进制字符 (16 字节), 实际 ${iv.length} 个字符`,
        };
      }
      options.iv = ivBytes;
    }

    const encrypted = CryptoJS.AES.encrypt(plaintext, keyBytes, options);

    let output: string;
    if (config.outputFormat === "Hex") {
      output = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    } else {
      output = encrypted.toString(); // Base64 by default
    }

    return { success: true, data: output };
  } catch (e) {
    return { success: false, error: `加密失败: ${(e as Error).message}` };
  }
}

export function aesDecrypt(
  ciphertext: string,
  key: string,
  iv: string,
  config: AesConfig
): AesResult {
  try {
    const keyBytes = CryptoJS.enc.Hex.parse(key);
    const expectedKeyLen = config.keySize / 8;
    if (keyBytes.sigBytes !== expectedKeyLen) {
      return {
        success: false,
        error: `密钥长度错误: 期望 ${expectedKeyLen * 2} 个十六进制字符 (${config.keySize} 位), 实际 ${key.length} 个字符`,
      };
    }

    const options: Record<string, unknown> = {
      mode: MODE_MAP[config.mode],
      padding: PADDING_MAP[config.padding],
    };

    if (config.mode !== "ECB") {
      const ivBytes = CryptoJS.enc.Hex.parse(iv);
      if (ivBytes.sigBytes !== 16) {
        return {
          success: false,
          error: `IV 长度错误: 期望 32 个十六进制字符 (16 字节), 实际 ${iv.length} 个字符`,
        };
      }
      options.iv = ivBytes;
    }

    let cipherParams: CryptoJS.lib.CipherParams;
    if (config.outputFormat === "Hex") {
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(ciphertext),
      });
    } else {
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(ciphertext),
      });
    }

    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyBytes, options);
    const result = decrypted.toString(CryptoJS.enc.Utf8);

    if (!result) {
      return { success: false, error: "解密失败: 结果为空，可能密钥或配置不正确" };
    }

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: `解密失败: ${(e as Error).message}` };
  }
}

export function generateRandomKey(size: KeySize): string {
  return CryptoJS.lib.WordArray.random(size / 8).toString(CryptoJS.enc.Hex);
}

export function generateRandomIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

export function validateKeyLength(key: string, expectedSize: KeySize): boolean {
  const expectedHexLen = (expectedSize / 8) * 2;
  return /^[0-9a-fA-F]*$/.test(key) && key.length === expectedHexLen;
}

export function validateIV(iv: string): boolean {
  return /^[0-9a-fA-F]*$/.test(iv) && iv.length === 32;
}

export function isValidDecryption(output: string): boolean {
  if (!output || output.length === 0) return false;
  // Check for replacement characters (invalid UTF-8)
  if (output.includes("\uFFFD")) return false;
  // Check printable character ratio
  let printable = 0;
  for (let i = 0; i < output.length; i++) {
    const code = output.charCodeAt(i);
    if (
      (code >= 0x20 && code <= 0x7e) || // ASCII printable
      code === 0x09 || // tab
      code === 0x0a || // newline
      code === 0x0d || // carriage return
      code >= 0x4e00   // CJK and other unicode
    ) {
      printable++;
    }
  }
  return printable / output.length > 0.9;
}
