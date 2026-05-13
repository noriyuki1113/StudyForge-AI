import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Sparkles, Clock } from "lucide-react";
import type { Deck } from "@/types/database";

export default async function DecksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // middleware が保護済み
  }

  const { data: decks } = await supabase
    .from("decks")
    .select("*, cards(count)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">デッキ一覧</h1>
          <Button asChild>
            <Link href="/generate">
              <Sparkles className="mr-2 h-4 w-4" />
              新規作成
            </Link>
          </Button>
        </div>

        {!decks || decks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="font-medium">まだデッキがありません</p>
              <p className="text-sm text-muted-foreground">
                最初のデッキを作ってみましょう
              </p>
              <Button asChild>
                <Link href="/generate">
                  <Sparkles className="mr-2 h-4 w-4" />
                  デッキを作成する
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {(decks as (Deck & { cards: { count: number }[] })[]).map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <Card className="hover:bg-secondary/30 transition-colors cursor-pointer">
                  <CardContent className="py-4 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium">{deck.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {deck.cards?.[0]?.count ?? 0} 枚
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(deck.updated_at).toLocaleDateString("ja-JP")}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
