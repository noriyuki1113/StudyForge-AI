"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, RefreshCw } from "lucide-react";

interface Props {
  front: string;
  back: string;
  onResult: (result: "correct" | "incorrect") => void;
}

export function Flashcard({ front, back, onResult }: Props) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => setFlipped(true);

  const handleResult = (result: "correct" | "incorrect") => {
    setFlipped(false);
    onResult(result);
  };

  return (
    <div className="space-y-4">
      {/* カード本体 */}
      <div
        className="w-full min-h-48 rounded-xl border-2 border-border bg-white shadow-sm cursor-pointer select-none flex items-center justify-center p-6 text-center transition-all active:scale-[0.98]"
        onClick={!flipped ? handleFlip : undefined}
        role="button"
        aria-label={flipped ? "裏面を表示中" : "タップして裏面を表示"}
      >
        {flipped ? (
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">表面</p>
              <p className="text-sm text-muted-foreground">{front}</p>
            </div>
            <hr />
            <div className="space-y-2">
              <p className="text-xs text-primary font-medium">答え</p>
              <p className="text-base font-medium whitespace-pre-wrap">{back}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">タップして答えを見る</p>
            <p className="text-lg font-semibold">{front}</p>
          </div>
        )}
      </div>

      {/* 結果ボタン（裏面表示後のみ） */}
      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => handleResult("incorrect")}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            もう一度
          </Button>
          <Button
            className="h-12 bg-green-600 hover:bg-green-700"
            onClick={() => handleResult("correct")}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            わかった！
          </Button>
        </div>
      )}
    </div>
  );
}
