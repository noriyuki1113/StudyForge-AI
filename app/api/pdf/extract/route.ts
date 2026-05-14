import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/parse-pdf";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "PDFファイルが必要です" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "PDFファイルのみ対応しています" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "10MB以内のPDFを選択してください" }, { status: 400 });
    }

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

    return NextResponse.json({
      title: file.name.replace(/\.pdf$/i, ""),
      text,
      charCount: text.length,
    });
  } catch (error) {
    console.error("pdf/extract error:", error);
    return NextResponse.json({ error: "テキストの抽出に失敗しました" }, { status: 500 });
  }
}
