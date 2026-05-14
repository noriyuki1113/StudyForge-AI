import { NextRequest, NextResponse } from "next/server";
import { generateCards } from "@/lib/ai/generate-cards";
import { parsePdf } from "@/lib/parse-pdf";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const cardCountRaw = formData.get("cardCount");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "PDFファイルが必要です" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "PDFファイルのみ対応しています" }, { status: 400 });
    }

    const cardCount = cardCountRaw ? Math.min(20, Math.max(1, parseInt(String(cardCountRaw), 10))) : 10;

    let text: string;
    try {
      text = await parsePdf(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      return NextResponse.json(
        { error: message || "PDFの解析に失敗しました。テキスト入力をお試しください。" },
        { status: 422 }
      );
    }

    const result = await generateCards(text, cardCount);
    return NextResponse.json(result);
  } catch (error) {
    console.error("from-pdf error:", error);
    return NextResponse.json(
      { error: "カードの生成に失敗しました。もう一度お試しください。" },
      { status: 502 }
    );
  }
}
