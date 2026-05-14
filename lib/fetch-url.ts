const MAX_CHARS = 8000;

export interface UrlContent {
  title: string | null;
  text: string;
}

export async function fetchUrlContent(url: string): Promise<UrlContent> {
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

  return {
    title: extractTitle(html),
    text: extractText(html),
  };
}

export async function fetchUrlText(url: string): Promise<string> {
  const { text } = await fetchUrlContent(url);
  return text;
}

function extractTitle(html: string): string | null {
  const match = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  if (!match) return null;
  const title = match[1].replace(/\s+/g, " ").trim();
  return title || null;
}

function extractText(html: string): string {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  const mainMatch =
    /<main[\s\S]*?>([\s\S]*?)<\/main>/i.exec(cleaned) ??
    /<article[\s\S]*?>([\s\S]*?)<\/article>/i.exec(cleaned);

  const source = mainMatch ? mainMatch[1] : cleaned;

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
