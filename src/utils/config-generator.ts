export interface GeneratorResult {
  success: boolean;
  data?: Record<string, string>;
  error?: string;
}

/**
 * 正则辅助：提取单行属性（对应 Java 的 getFirstMatch）
 */
function getFirstMatch(content: string, regex: string): string | null {
  const pattern = new RegExp(regex);
  const match = content.match(pattern);
  return match ? match[1]!.trim() : null;
}

/**
 * 正则辅助：提取缩进级属性（对应 Java 的 getSubValue）
 * 正则: section:[\s\S]*?\s{key}:\s*([^\s\n#]+)
 */
function getSubValue(content: string, section: string, key: string): string | null {
  const regex = section + ":[\\s\\S]*?\\s" + key + ":\\s*([^\\s\\n#]+)";
  return getFirstMatch(content, regex);
}

/**
 * 通过阿里 DNS API 解析域名 IP（对应 Java 的 getRealIpViaApi）
 */
export async function getRealIpViaApi(host: string): Promise<string | null> {
  try {
    const url = `https://dns.alidns.com/resolve?name=${host}&type=1`;
    const response = await fetch(url);
    const text = await response.text();
    const match = text.match(/"data":"([0-9.]+)"/);
    return match ? match[1]! : null;
  } catch {
    return null;
  }
}

/**
 * 主解析逻辑（对应 Java 的 main 方法）
 *
 * 规则：
 * 1. server = 正式环境接口第一个 URL 域名的 DNS 解析 IP
 * 2. CRYPT_TYPE = "AES"（固定值）
 * 3. REQUEST_KEY = 中转服务器配置的 aes_key,aes_iv
 * 4. PACKAGE = 包名
 * 5. CWConfig = 后台配置的 package_key,sign_key,aes_key,aes_iv
 * 6. DEV_PCG = 假包名
 */
export async function generateConfig(content: string): Promise<GeneratorResult> {
  try {
    const result: Record<string, string> = {};

    // 1. 解析 Server (提取正式环境接口第一个域名的 IP)
    // 正则: 正式环境接口:\s*-\s*(https?://[^/\s#]+)
    const officialApi = getFirstMatch(content, "正式环境接口:\\s*-\\s*(https?://[^/\\s#]+)");
    if (officialApi) {
      const url = new URL(officialApi);
      const ip = await getRealIpViaApi(url.hostname);
      if (ip) {
        result["server"] = ip;
      }
    }

    // 2. CRYPT_TYPE（固定）
    result["CRYPT_TYPE"] = "AES";

    // 3. REQUEST_KEY (中转服务器配置: aes_key,aes_iv)
    const midKey = getSubValue(content, "中转服务器配置", "aes_key");
    const midIv = getSubValue(content, "中转服务器配置", "aes_iv");
    if (midKey && midIv) {
      result["REQUEST_KEY"] = `${midKey},${midIv}`;
    }

    // 4. PACKAGE (包名)
    // 正则: 包名:\s*([^\s\n]+)
    const pkg = getFirstMatch(content, "包名:\\s*([^\\s\\n]+)");
    if (pkg) {
      result["PACKAGE"] = pkg;
    }

    // 5. CWConfig (后台配置: package_key,sign_key,aes_key,aes_iv)
    const bPk = getSubValue(content, "后台配置", "package_key");
    const bSk = getSubValue(content, "后台配置", "sign_key");
    const bAk = getSubValue(content, "后台配置", "aes_key");
    const bAi = getSubValue(content, "后台配置", "aes_iv");
    if (bPk) {
      result["CWConfig"] = `${bPk},${bSk},${bAk},${bAi}`;
    }

    // 6. DEV_PCG (假包名)
    // 正则: 假包名:\s*([^\s\n]+)
    const fakePkg = getFirstMatch(content, "假包名:\\s*([^\\s\\n]+)");
    if (fakePkg) {
      result["DEV_PCG"] = fakePkg;
    }

    if (Object.keys(result).length === 0) {
      return { success: false, error: "未能从输入中解析出任何配置项，请检查输入格式" };
    }

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: `解析失败: ${(e as Error).message}` };
  }
}

/**
 * 将结果格式化为 key=value 字符串
 */
export function formatOutput(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}
