import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Sparkles, BookOpen, ArrowRight, Clock } from "lucide-react";
import type { Deck } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let recentDecks: Deck[] = [];
  if (user) {
    const { data } = await supabase
      .from("decks")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5);
    recentDecks = data ?? [];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {user ? (
          <Dashboard recentDecks={recentDecks} />
        ) : (
          <LandingPage />
        )}
      </main>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-16">
      {/* ヒーロー */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          教材を貼るだけで<br />
          <span className="text-primary">フラッシュカード</span>を自動生成
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          技術記事・GitHub README・メモを入力するだけで、AIが重要ポイントを抽出してフラッシュカードと小テストを作成します。
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              はじめる（無料）<ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/auth/login">ログイン</Link>
          </Button>
        </div>
      </div>

      {/* 使い方 3 ステップ */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          {
            icon: FileText,
            step: "1",
            title: "教材を入力",
            desc: "テキストを貼り付けるか、URLを入力するだけ",
          },
          {
            icon: Sparkles,
            step: "2",
            title: "AIが自動生成",
            desc: "重要ポイントをフラッシュカード10枚・クイズ5問に変換",
          },
          {
            icon: BookOpen,
            step: "3",
            title: "繰り返し学習",
            desc: "いつでも復習して知識を定着させる",
          },
        ].map((item) => (
          <Card key={item.step} className="text-center">
            <CardContent className="pt-6 pb-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">STEP {item.step}</p>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 対象ジャンル */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">対応ジャンル</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {["Claude Code", "Linux", "Git / GitHub", "Supabase", "n8n", "VPS 運用"].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ recentDecks }: { recentDecks: Deck[] }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button asChild>
          <Link href="/generate">
            <Sparkles className="mr-2 h-4 w-4" />
            新しいデッキを作る
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">最近のデッキ</h2>
          {recentDecks.length > 0 && (
            <Link href="/decks" className="text-sm text-primary hover:underline">
              すべて見る
            </Link>
          )}
        </div>

        {recentDecks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="font-medium">まだデッキがありません</p>
              <p className="text-sm text-muted-foreground">最初のデッキを作ってみましょう</p>
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
            {recentDecks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <Card className="hover:bg-secondary/30 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{deck.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(deck.updated_at).toLocaleDateString("ja-JP")}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
