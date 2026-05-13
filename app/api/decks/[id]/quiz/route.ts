import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("deck_id", deckId)
      .order("created_at");

    if (error) throw error;
    return NextResponse.json({ quizzes: data ?? [] });
  } catch (error) {
    console.error("GET /api/decks/[id]/quiz error:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
