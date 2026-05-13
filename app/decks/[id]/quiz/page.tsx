import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { QuizClient } from "./QuizClient";
import { generateQuiz } from "@/lib/ai/generate-quiz";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { GeneratedCard } from "@/types/ai";

export default async function QuizPage({
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
    .select("id, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!deck) notFound();

  let { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .eq("deck_id", id)
    .limit(5);

  if (!quizzes || quizzes.length === 0) {
    const { data: cards } = await supabase
      .from("cards")
      .select("id, front, back")
      .eq("deck_id", id)
      .order("position");

    if (!cards || cards.length === 0) notFound();

    const cardInputs: GeneratedCard[] = cards.map((c) => ({
      front: c.front,
      back: c.back,
    }));

    const result = await generateQuiz(cardInputs, 5);

    const quizRows = result.quizzes.map((q, i) => ({
      deck_id: id,
      card_id: cards[i % cards.length]?.id ?? null,
      question: q.question,
      choices: q.choices,
      answer_index: q.answer_index,
    }));

    const { data: saved } = await supabase
      .from("quizzes")
      .insert(quizRows)
      .select();

    quizzes = saved;
  }

  if (!quizzes || quizzes.length === 0) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/decks/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {deck.name}
          </Link>
        </div>
        <h1 className="text-xl font-bold">小テスト</h1>
        <QuizClient quizzes={quizzes} deckId={id} />
      </main>
    </div>
  );
}
