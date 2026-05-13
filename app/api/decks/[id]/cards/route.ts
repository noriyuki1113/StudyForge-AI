import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PatchSchema = z.object({
  cardId: z.string().uuid(),
  front: z.string().min(1),
  back: z.string().min(1),
});

const DeleteSchema = z.object({
  cardId: z.string().uuid(),
});

async function getAuthenticatedUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function userOwnsDeck(
  supabase: Awaited<ReturnType<typeof createClient>>,
  deckId: string,
  userId: string
) {
  const { data } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    if (!(await userOwnsDeck(supabase, deckId, user.id))) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "入力が不正です" }, { status: 400 });

    const { cardId, front, back } = parsed.data;
    const { error } = await supabase
      .from("cards")
      .update({ front, back })
      .eq("id", cardId)
      .eq("deck_id", deckId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/decks/[id]/cards error:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    if (!(await userOwnsDeck(supabase, deckId, user.id))) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "入力が不正です" }, { status: 400 });

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", parsed.data.cardId)
      .eq("deck_id", deckId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/decks/[id]/cards error:", error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
