import { NextRequest, NextResponse } from "next/server";
import { fetchUrlContent } from "@/lib/fetch-url";
import { z } from "zod";

const Schema = z.object({
  url: z.string().url().regex(/^https?:\/\//i),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "URLが不正です" }, { status: 400 });
    }

    const { url } = parsed.data;

    let content: { title: string | null; text: string };
    try {
      content = await fetchUrlContent(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("タイムアウト") || message.includes("abort")) {
        return NextResponse.json(
          { error: "URLからの情報取得がタイムアウトしました。テキスト入力をお試しください。" },
          { status: 504 }
        );
      }
      if (message.includes("抽出できません") || message.includes("取得できません")) {
        return NextResponse.json(
          { error: "このページからテキストを取得できませんでした。テキスト入力をお試しください。" },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: "URLにアクセスできませんでした。URLを確認するか、テキスト入力をお試しください。" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      title: content.title,
      text: content.text,
      charCount: content.text.length,
    });
  } catch (error) {
    console.error("preview-url error:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
