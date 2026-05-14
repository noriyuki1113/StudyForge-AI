"use client";

import { useState } from "react";
import { Flashcard } from "@/components/study/Flashcard";
import { StudyProgress } from "@/components/study/StudyProgress";
import { StudySummary } from "@/components/study/StudySummary";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { shuffle } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/database";

interface Props {
  cards: Card[];
  deckId: string;
}

export function StudyClient({ cards, deckId }: Props) {
  const [shuffleOn, setShuffleOn] = useState(false);
  const [deck, setDeck] = useState<Card[]>(cards);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const reset = (nextDeck: Card[]) => {
    setDeck(nextDeck);
    setIndex(0);
    setCorrect(0);
    setDone(false);
  };

  const handleToggleShuffle = () => {
    const next = !shuffleOn;
    setShuffleOn(next);
    reset(next ? shuffle(cards) : [...cards]);
  };

  const handleRetry = () => {
    reset(shuffleOn ? shuffle(cards) : [...cards]);
  };

  const postLog = (cardId: string, result: "correct" | "incorrect") => {
    fetch("/api/review-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, result, studyMode: "flashcard" }),
    }).catch(() => {});
  };

  const handleResult = (result: "correct" | "incorrect") => {
    postLog(deck[index].id, result);
    const nextCorrect = result === "correct" ? correct + 1 : correct;
    const nextIndex = index + 1;
    if (nextIndex >= deck.length) {
      setCorrect(nextCorrect);
      setDone(true);
    } else {
      setCorrect(nextCorrect);
      setIndex(nextIndex);
    }
  };

  if (done) {
    return (
      <StudySummary
        correct={correct}
        total={deck.length}
        deckId={deckId}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <StudyProgress current={index + 1} total={deck.length} />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleShuffle}
          className={cn(
            "ml-3 shrink-0 gap-1.5 text-xs",
            shuffleOn ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Shuffle className="h-3.5 w-3.5" />
          シャッフル
        </Button>
      </div>
      <Flashcard
        key={`${index}-${deck[index].id}`}
        front={deck[index].front}
        back={deck[index].back}
        onResult={handleResult}
      />
    </div>
  );
}
