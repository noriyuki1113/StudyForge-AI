import { NextRequest, NextResponse } from "next/server";
import { generateCards } from "@/lib/ai/generate-cards";
import { fetchUrlText } from "@/lib/fetch-url";
import { GenerateFromUrlSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateFromUrlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "URLが不正です" },
        { status: 400 }
      );
    }

    const { url, cardCount } = parsed.data;

    let text: string;
    try {
      text = await fetchUrlText(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("タイムアウト") || message.includes("abort")) {
        return NextResponse.json(
          { error: "URLからの情報取得がタイムアウトしました。テキスト入力をお試しください。" },
          { status: 504 }
        );
      }
      if (message.includes("抽出できません")) {
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

    const result = await generateCards(text, cardCount);
    return NextResponse.json(result);
  } catch (error) {
    console.error("from-url error:", error);
    return NextResponse.json(
      { error: "カードの生成に失敗しました。もう一度お試しください。" },
      { status: 502 }
    );
  }
}
