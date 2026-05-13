"use client";

import { useState } from "react";
import { Flashcard } from "@/components/study/Flashcard";
import { StudyProgress } from "@/components/study/StudyProgress";
import { StudySummary } from "@/components/study/StudySummary";
import type { Card } from "@/types/database";

interface Props {
  cards: Card[];
  deckId: string;
}

export function StudyClient({ cards, deckId }: Props) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const handleRetry = () => {
    setIndex(0);
    setCorrect(0);
    setDone(false);
  };

  const postLog = (cardId: string, result: "correct" | "incorrect") => {
    fetch("/api/review-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, result, studyMode: "flashcard" }),
    }).catch(() => {});
  };

  const handleResult = (result: "correct" | "incorrect") => {
    postLog(cards[index].id, result);
    const nextCorrect = result === "correct" ? correct + 1 : correct;
    const nextIndex = index + 1;
    if (nextIndex >= cards.length) {
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
        total={cards.length}
        deckId={deckId}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <StudyProgress current={index + 1} total={cards.length} />
      <Flashcard
        key={index}
        front={cards[index].front}
        back={cards[index].back}
        onResult={handleResult}
      />
    </div>
  );
}
