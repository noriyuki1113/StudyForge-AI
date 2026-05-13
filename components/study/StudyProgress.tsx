import { Progress } from "@/components/ui/progress";

interface Props {
  current: number;
  total: number;
}

export function StudyProgress({ current, total }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{current} / {total}</span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}
