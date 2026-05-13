import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ReviewLogSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const body = await request.json();
    const parsed = ReviewLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
    }

    const { cardId, result, studyMode } = parsed.data;
    const { error } = await supabase.from("review_logs").insert({
      user_id: user.id,
      card_id: cardId,
      result,
      study_mode: studyMode,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/review-logs error:", error);
    return NextResponse.json({ error: "記録に失敗しました" }, { status: 500 });
  }
}
