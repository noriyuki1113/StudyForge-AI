import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, BookOpen, Brain } from "lucide-react";
import Link from "next/link";

interface Props {
  correct: number;
  total: number;
  deckId: string;
  onRetry: () => void;
  weakCount?: number;
  onRetryWeak?: () => void;
}

export function StudySummary({ correct, total, deckId, onRetry, weakCount, onRetryWeak }: Props) {
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="text-center space-y-6 py-8">
      <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
      <div className="space-y-1">
        <p className="text-3xl font-bold">{rate}%</p>
        <p className="text-muted-foreground">
          {total} 枚中 {correct} 枚「わかった」
        </p>
      </div>
      <div className="flex flex-col gap-3 items-center">
        {weakCount && weakCount > 0 && onRetryWeak && (
          <Button
            className="w-full max-w-xs bg-orange-500 hover:bg-orange-600"
            onClick={onRetryWeak}
          >
            <Brain className="mr-2 h-4 w-4" />
            苦手カードだけやり直す（{weakCount}枚）
          </Button>
        )}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            もう一度
          </Button>
          <Button asChild>
            <Link href={`/decks/${deckId}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              デッキに戻る
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
