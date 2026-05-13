"use client";

import { useState } from "react";
import { CardEditor } from "@/components/decks/CardEditor";
import type { Card } from "@/types/database";

interface Props {
  initialCards: Card[];
  deckId: string;
}

export function DeckCardsClient({ initialCards, deckId }: Props) {
  const [cards, setCards] = useState<Card[]>(initialCards);

  const handleUpdated = (updated: Card) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleted = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  if (cards.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        カードがありません
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">カード一覧</h2>
      {cards.map((card) => (
        <CardEditor
          key={card.id}
          card={card}
          deckId={deckId}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
