"use client";

import { useState } from "react";
import { QuizQuestion } from "@/components/study/QuizQuestion";
import { QuizSummary } from "@/components/study/QuizSummary";
import { StudyProgress } from "@/components/study/StudyProgress";
import type { Quiz } from "@/types/database";

interface Props {
  quizzes: Quiz[];
  deckId: string;
}

export function QuizClient({ quizzes, deckId }: Props) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  const handleRetry = () => {
    setIndex(0);
    setResults([]);
    setDone(false);
  };

  const postLog = (cardId: string | null, correct: boolean) => {
    if (!cardId) return;
    fetch("/api/review-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId,
        result: correct ? "correct" : "incorrect",
        studyMode: "quiz",
      }),
    }).catch(() => {});
  };

  const handleResult = (correct: boolean) => {
    postLog(quizzes[index].card_id, correct);
    const nextResults = [...results, correct];
    const nextIndex = index + 1;
    if (nextIndex >= quizzes.length) {
      setResults(nextResults);
      setDone(true);
    } else {
      setResults(nextResults);
      setIndex(nextIndex);
    }
  };

  if (done) {
    return (
      <QuizSummary results={results} deckId={deckId} onRetry={handleRetry} />
    );
  }

  return (
    <div className="space-y-6">
      <StudyProgress current={index + 1} total={quizzes.length} />
      <QuizQuestion
        key={index}
        quiz={quizzes[index]}
        index={index}
        total={quizzes.length}
        onResult={handleResult}
      />
    </div>
  );
}
