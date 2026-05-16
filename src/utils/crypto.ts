import CryptoJS from "crypto-js";

export type AesMode = "ECB" | "CBC" | "CFB" | "OFB" | "CTR";
export type AesPadding = "Pkcs7" | "ZeroPadding" | "NoPadding";
export type OutputFormat = "Base64" | "Hex";
export type KeyFormat = "Hex" | "UTF-8";
export type KeySize = 128 | 192 | 256;

export interface AesConfig {
  mode: AesMode;
  padding: AesPadding;
  outputFormat: OutputFormat;
  keyFormat: KeyFormat;
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

function parseKeyBytes(key: string, format: KeyFormat): CryptoJS.lib.WordArray {
  if (format === "Hex") {
    return CryptoJS.enc.Hex.parse(key);
  }
  return CryptoJS.enc.Utf8.parse(key);
}

function getExpectedKeyLength(keySize: KeySize, format: KeyFormat): { bytes: number; display: string } {
  const bytes = keySize / 8;
  if (format === "Hex") {
    return { bytes, display: `${bytes * 2} 个十六进制字符` };
  }
  return { bytes, display: `${bytes} 个字符` };
}

function getExpectedIVLength(format: KeyFormat): { bytes: number; display: string } {
  if (format === "Hex") {
    return { bytes: 16, display: "32 个十六进制字符" };
  }
  return { bytes: 16, display: "16 个字符" };
}

export function aesEncrypt(
  plaintext: string,
  key: string,
  iv: string,
  config: AesConfig
): AesResult {
  try {
    const keyBytes = parseKeyBytes(key, config.keyFormat);
    const expected = getExpectedKeyLength(config.keySize, config.keyFormat);
    if (keyBytes.sigBytes !== expected.bytes) {
      return {
        success: false,
        error: `密钥长度错误: 期望 ${expected.display} (${config.keySize} 位), 实际 ${key.length} 个字符`,
      };
    }

    const options: Record<string, unknown> = {
      mode: MODE_MAP[config.mode],
      padding: PADDING_MAP[config.padding],
    };

    if (config.mode !== "ECB") {
      const ivBytes = parseKeyBytes(iv, config.keyFormat);
      const ivExpected = getExpectedIVLength(config.keyFormat);
      if (ivBytes.sigBytes !== ivExpected.bytes) {
        return {
          success: false,
          error: `IV 长度错误: 期望 ${ivExpected.display} (16 字节), 实际 ${iv.length} 个字符`,
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
    const keyBytes = parseKeyBytes(key, config.keyFormat);
    const expected = getExpectedKeyLength(config.keySize, config.keyFormat);
    if (keyBytes.sigBytes !== expected.bytes) {
      return {
        success: false,
        error: `密钥长度错误: 期望 ${expected.display} (${config.keySize} 位), 实际 ${key.length} 个字符`,
      };
    }

    const options: Record<string, unknown> = {
      mode: MODE_MAP[config.mode],
      padding: PADDING_MAP[config.padding],
    };

    if (config.mode !== "ECB") {
      const ivBytes = parseKeyBytes(iv, config.keyFormat);
      const ivExpected = getExpectedIVLength(config.keyFormat);
      if (ivBytes.sigBytes !== ivExpected.bytes) {
        return {
          success: false,
          error: `IV 长度错误: 期望 ${ivExpected.display} (16 字节), 实际 ${iv.length} 个字符`,
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

export function generateRandomKey(size: KeySize, format: KeyFormat = "Hex"): string {
  const bytes = CryptoJS.lib.WordArray.random(size / 8);
  if (format === "Hex") {
    return bytes.toString(CryptoJS.enc.Hex);
  }
  // Generate printable ASCII characters for UTF-8 mode
  const len = size / 8;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomIV(format: KeyFormat = "Hex"): string {
  const bytes = CryptoJS.lib.WordArray.random(16);
  if (format === "Hex") {
    return bytes.toString(CryptoJS.enc.Hex);
  }
  const len = 16;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
