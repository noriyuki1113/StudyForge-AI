import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { DeckHeader } from "@/components/decks/DeckHeader";
import { DeckStats } from "@/components/decks/DeckStats";
import { DeckCardsClient } from "./DeckCardsClient";
import Link from "next/link";
import { BookOpen, Trophy } from "lucide-react";
import type { Card } from "@/types/database";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: deck } = await supabase
    .from("decks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!deck) notFound();

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("deck_id", id)
    .order("position");

  // 直近30件の学習ログを集計
  const { data: logs } = await supabase
    .from("review_logs")
    .select("result, reviewed_at")
    .in("card_id", (cards ?? []).map((c: Card) => c.id))
    .order("reviewed_at", { ascending: false })
    .limit(30);

  const lastStudiedAt = logs?.[0]?.reviewed_at ?? null;
  const correctCount = (logs ?? []).filter((l) => l.result === "correct").length;
  const totalCount = logs?.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <DeckHeader
          deckId={id}
          deckName={deck.name}
          cardCount={(cards ?? []).length}
        />

        <DeckStats
          lastStudiedAt={lastStudiedAt}
          correctCount={correctCount}
          totalCount={totalCount}
        />

        {/* アクションボタン */}
        <div className="flex gap-3">
          {(cards ?? []).length === 0 ? (
            <>
              <Button className="flex-1" disabled>
                <BookOpen className="mr-2 h-4 w-4" />
                学習する
              </Button>
              <Button variant="outline" className="flex-1" disabled>
                <Trophy className="mr-2 h-4 w-4" />
                小テスト
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="flex-1">
                <Link href={`/decks/${id}/study`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  学習する
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/decks/${id}/quiz`}>
                  <Trophy className="mr-2 h-4 w-4" />
                  小テスト
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* カード一覧（クライアント側で編集・削除） */}
        <DeckCardsClient initialCards={cards ?? []} deckId={id} />
      </main>
    </div>
  );
}
