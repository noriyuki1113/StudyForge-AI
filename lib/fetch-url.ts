const MAX_CHARS = 8000;

export async function fetchUrlText(url: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("URL は http:// または https:// で始める必要があります");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let html: string;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "StudyForgeAI/1.0" },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error("HTMLページ以外は取得できません");
    }
    html = await response.text();
  } finally {
    clearTimeout(timeout);
  }

  return extractText(html);
}

function extractText(html: string): string {
  // スクリプト・スタイル除去
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  // main / article 優先、なければ body 全体
  const mainMatch =
    /<main[\s\S]*?>([\s\S]*?)<\/main>/i.exec(cleaned) ??
    /<article[\s\S]*?>([\s\S]*?)<\/article>/i.exec(cleaned);

  const source = mainMatch ? mainMatch[1] : cleaned;

  // タグ除去・空白正規化
  const text = source
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    throw new Error("ページからテキストを抽出できませんでした");
  }

  return text.slice(0, MAX_CHARS);
}
