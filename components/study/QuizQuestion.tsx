"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Quiz } from "@/types/database";

interface Props {
  quiz: Quiz;
  index: number;
  total: number;
  onResult: (correct: boolean) => void;
}

export function QuizQuestion({ quiz, index, total, onResult }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
  };

  const handleNext = () => {
    if (selected === null) return;
    onResult(selected === quiz.answer_index);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          {index + 1} / {total}
        </p>
        <p className="text-base font-semibold leading-relaxed">{quiz.question}</p>
      </div>

      <div className="space-y-3">
        {(quiz.choices as string[]).map((choice, i) => {
          const isSelected = selected === i;
          const isCorrect = selected !== null && i === quiz.answer_index;
          const isWrong = isSelected && i !== quiz.answer_index;

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors",
                selected === null && "border-border hover:border-primary hover:bg-primary/5",
                isCorrect && "border-green-500 bg-green-50 text-green-800",
                isWrong && "border-red-400 bg-red-50 text-red-800",
                selected !== null && !isCorrect && !isWrong && "border-border text-muted-foreground"
              )}
            >
              <span className="font-medium mr-2">{["A", "B", "C", "D"][i]}.</span>
              {choice}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="space-y-3">
          <p
            className={cn(
              "text-sm font-medium",
              selected === quiz.answer_index ? "text-green-700" : "text-red-600"
            )}
          >
            {selected === quiz.answer_index ? "正解！" : `不正解。正解は ${["A", "B", "C", "D"][quiz.answer_index]} です。`}
          </p>
          <Button className="w-full" onClick={handleNext}>
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
