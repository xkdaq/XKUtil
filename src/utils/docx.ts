import mammoth from "mammoth";

export interface DocxConversionResult {
  success: boolean;
  html?: string;
  imageCount?: number;
  messages?: string[];
  error?: string;
}

export async function convertDocxToHtml(
  arrayBuffer: ArrayBuffer
): Promise<DocxConversionResult> {
  try {
    let imageCount = 0;

    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        convertImage: mammoth.images.imgElement(() => {
          imageCount++;
          return Promise.resolve({ src: "" });
        }),
      }
    );

    // 清除空 img 标签
    let html = result.value.replace(/<img[^>]*src=""[^>]*\/?>/g, "");

    const messages = result.messages
      .filter((m) => m.type === "warning")
      .map((m) => m.message);

    return {
      success: true,
      html,
      imageCount,
      messages,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "未知错误";
    return {
      success: false,
      error: `转换失败: ${msg}`,
    };
  }
}
