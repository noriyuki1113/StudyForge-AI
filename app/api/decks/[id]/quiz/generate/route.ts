import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuiz } from "@/lib/ai/generate-quiz";
import type { GeneratedCard } from "@/types/ai";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    // デッキのオーナー確認 + カード取得
    const { data: deck } = await supabase
      .from("decks")
      .select("id, user_id")
      .eq("id", deckId)
      .eq("user_id", user.id)
      .single();

    if (!deck) return NextResponse.json({ error: "デッキが見つかりません" }, { status: 404 });

    const { data: cards } = await supabase
      .from("cards")
      .select("id, front, back")
      .eq("deck_id", deckId)
      .order("position");

    if (!cards || cards.length === 0) {
      return NextResponse.json({ error: "カードがありません" }, { status: 400 });
    }

    const cardInputs: GeneratedCard[] = cards.map((c) => ({
      front: c.front,
      back: c.back,
    }));

    const result = await generateQuiz(cardInputs, 5);

    // quiz テーブルに保存
    const quizRows = result.quizzes.map((q, i) => ({
      deck_id: deckId,
      card_id: cards[i % cards.length]?.id ?? null,
      question: q.question,
      choices: q.choices,
      answer_index: q.answer_index,
    }));

    const { data: savedQuizzes, error: insertError } = await supabase
      .from("quizzes")
      .insert(quizRows)
      .select();

    if (insertError) throw insertError;
    return NextResponse.json({ quizzes: savedQuizzes }, { status: 201 });
  } catch (error) {
    console.error("POST /api/decks/[id]/quiz/generate error:", error);
    return NextResponse.json(
      { error: "クイズの生成に失敗しました。もう一度お試しください。" },
      { status: 502 }
    );
  }
}
