import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, BookOpen } from "lucide-react";
import Link from "next/link";

interface Props {
  correct: number;
  total: number;
  deckId: string;
  onRetry: () => void;
}

export function StudySummary({ correct, total, deckId, onRetry }: Props) {
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
  );
}
