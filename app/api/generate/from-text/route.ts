import { NextRequest, NextResponse } from "next/server";
import { generateCards } from "@/lib/ai/generate-cards";
import { GenerateFromTextSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateFromTextSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力が不正です" },
        { status: 400 }
      );
    }

    const { text, cardCount } = parsed.data;
    const result = await generateCards(text, cardCount);
    return NextResponse.json(result);
  } catch (error) {
    console.error("from-text error:", error);
    return NextResponse.json(
      { error: "カードの生成に失敗しました。もう一度お試しください。" },
      { status: 502 }
    );
  }
}
