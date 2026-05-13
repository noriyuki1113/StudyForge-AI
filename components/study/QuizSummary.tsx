import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  results: boolean[];
  deckId: string;
  onRetry: () => void;
}

export function QuizSummary({ results, deckId, onRetry }: Props) {
  const correct = results.filter(Boolean).length;
  const total = results.length;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <Trophy className="h-16 w-16 text-primary mx-auto" />
        <p className="text-3xl font-bold">{rate}%</p>
        <p className="text-muted-foreground">
          {total} 問中 {correct} 問正解
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">問題ごとの結果</p>
        <div className="space-y-1">
          {results.map((ok, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              )}
            >
              <span className={cn("font-bold", ok ? "text-green-600" : "text-red-500")}>
                {ok ? "○" : "✕"}
              </span>
              <span>問題 {i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onRetry}>
          <RotateCcw className="mr-2 h-4 w-4" />
          もう一度
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/decks/${deckId}`}>
            <BookOpen className="mr-2 h-4 w-4" />
            デッキに戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}
