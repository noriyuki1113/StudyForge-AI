import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";

interface Props {
  lastStudiedAt: string | null;
  correctCount: number;
  totalCount: number;
}

export function DeckStats({ lastStudiedAt, correctCount, totalCount }: Props) {
  const rate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : null;

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-4 w-4" />
        {lastStudiedAt
          ? `${new Date(lastStudiedAt).toLocaleDateString("ja-JP")} に学習`
          : "まだ学習していません"}
      </div>
      {rate !== null && (
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">直近の正解率:</span>
          <Badge variant={rate >= 70 ? "default" : "secondary"}>
            {correctCount} / {totalCount}（{rate}%）
          </Badge>
        </div>
      )}
    </div>
  );
}
