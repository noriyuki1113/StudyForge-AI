import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { StudyClient } from "./StudyClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function StudyPage({
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

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("deck_id", id)
    .order("position");

  if (!cards || cards.length === 0) notFound();

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
        <h1 className="text-xl font-bold">フラッシュカード学習</h1>
        <StudyClient cards={cards} deckId={id} />
      </main>
    </div>
  );
}
