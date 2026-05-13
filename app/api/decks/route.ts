import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SaveDeckSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SaveDeckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力が不正です" },
        { status: 400 }
      );
    }

    const { deckName, cards, sourceInput } = parsed.data;

    // デッキを作成
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .insert({ name: deckName, user_id: user.id })
      .select()
      .single();

    if (deckError || !deck) {
      throw deckError ?? new Error("デッキの作成に失敗しました");
    }

    // カードを一括挿入
    const cardRows = cards.map((c, i) => ({
      deck_id: deck.id,
      front: c.front,
      back: c.back,
      position: i,
    }));
    const { error: cardsError } = await supabase.from("cards").insert(cardRows);
    if (cardsError) throw cardsError;

    // 生成元を記録
    if (sourceInput) {
      await supabase.from("source_inputs").insert({
        deck_id: deck.id,
        input_type: sourceInput.inputType,
        content: sourceInput.content.slice(0, 10000),
      });
    }

    return NextResponse.json({ deckId: deck.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/decks error:", error);
    return NextResponse.json(
      { error: "保存に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
