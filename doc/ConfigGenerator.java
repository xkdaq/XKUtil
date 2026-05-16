package com.config;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ConfigGenerator {

    static String content = "应用名: RupeeFlow\n" +
            "包名: com.rupeeflow.creditpath\n" +
            "假包名: com.rupeeflow.credit.path\n" +
            "官网域名: rupeeflowcard.com\n" +
            "app域名: flowcreditoffcial.com\n" +
            "app备用域名: limitstride.com\n" +
            "后台配置:\n" +
            "  package_key: IQzleWdkwZYGmmPH\n" +
            "  sign_key: Bhklh7rJVDQeeNEh\n" +
            "  aes_key: 7W7ds2BQR8aPLuLYOwqZMnL8EET3fjsu\n" +
            "  aes_iv: n1SdS35R0UaBj8UD\n" +
            "中转服务器配置:\n" +
            "  aes_key: 7W7ds2BQR8aPLuLYOwqZMnL8EET3fjsu\n" +
            "  aes_iv: n1SdS35R0UaBj8UD\n" +
            "正式环境接口:\n" +
            "  - https://ictiveli.flowcreditoffcial.com/orderapi/    入口\n" +
            "  - https://ictiveli.flowcreditoffcial.com/objectquery/    安卓 H5\n" +
            "  - https://ictiveli.flowcreditoffcial.com/cdntempfiles/    静态资源（APK/前端图片）";

    public static void main(String[] args) {

        Map<String, String> result = new LinkedHashMap<>();

        try {
            // 1. 解析 Server (提取正式环境接口第一个域名的 IP)
            String officialApi = getFirstMatch(content, "正式环境接口:\\s*-\\s*(https?://[^/\\s#]+)");
            if (officialApi != null) {
                String host = new URL(officialApi).getHost();
                result.put("server", getRealIpViaApi(host));
            }

            // 2. CRYPT_TYPE
            result.put("CRYPT_TYPE", "AES");

            // 3. REQUEST_KEY (中转服务器配置: aes_key,aes_iv)
            String midKey = getSubValue(content, "中转服务器配置", "aes_key");
            String midIv = getSubValue(content, "中转服务器配置", "aes_iv");
            if (midKey != null && midIv != null) {
                result.put("REQUEST_KEY", midKey + "," + midIv);
            }

            // 4. PACKAGE (包名)
            String pkg = getFirstMatch(content, "包名:\\s*([^\\s\n]+)");
            if (pkg != null && !pkg.isEmpty()) {
                result.put("PACKAGE", pkg);
            }

            // 5. CWConfig (后台配置: package_key,sign_key,aes_key,aes_iv)
            String bPk = getSubValue(content, "后台配置", "package_key");
            String bSk = getSubValue(content, "后台配置", "sign_key");
            String bAk = getSubValue(content, "后台配置", "aes_key");
            String bAi = getSubValue(content, "后台配置", "aes_iv");
            if (bPk != null) {
                result.put("CWConfig", String.format("%s,%s,%s,%s", bPk, bSk, bAk, bAi));
            }

            // 6. DEV_PCG (假包名)
            String fakePkg = getFirstMatch(content, "假包名:\\s*([^\\s\n]+)");
            if (fakePkg != null && !fakePkg.isEmpty()) {
                result.put("DEV_PCG", fakePkg);
            }

            // 输出结果为 Jenkins 可识别的键值对格式
            result.forEach((k, v) -> System.out.println(k + "=" + v));

        } catch (Exception e) {
            System.err.println("解析失败: " + e.getMessage());
        }
    }

    // 正则辅助：提取单行属性
    private static String getFirstMatch(String content, String regex) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(content);
        return matcher.find() ? matcher.group(1).trim() : null;
    }

    // 正则辅助：提取缩进级属性 (针对后台配置和中转配置)
    private static String getSubValue(String content, String section, String key) {
        String regex = section + ":[\\s\\S]*?\\s" + key + ":\\s*([^\\s\n#]+)";
        return getFirstMatch(content, regex);
    }
    // 替换原有的 InetAddress.getByName(host) 逻辑
    private static String getRealIpViaApi(String host) {
        try {
            // 使用阿里 DNS 的 HTTP 接口（国内环境稳定）
            String urlStr = "https://dns.alidns.com/resolve?name=" + host + "&type=1";
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();

            // 简单的正则解析 JSON 中的第一个 IP 地址
            // JSON 格式示例: {"Status":0,"Answer":[{"name":"...","type":1,"TTL":31,"data":"1.2.3.4"}]}
            Pattern p = Pattern.compile("\"data\":\"([0-9.]+)\"");
            Matcher m = p.matcher(response.toString());
            if (m.find()) {
                return m.group(1);
            }
        } catch (Exception e) {
            System.err.println("在线解析失败: " + e.getMessage());
        }
        return null; // 解析失败返回空
    }

}
