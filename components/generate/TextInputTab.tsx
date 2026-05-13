"use client";

import { Textarea } from "@/components/ui/textarea";

const MAX = 8000;

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function TextInputTab({ value, onChange }: Props) {
  const remaining = MAX - value.length;
  const isOver = value.length > MAX;

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="ここに教材テキストを貼り付けてください（技術記事、GitHub README、メモなど）"
        className="min-h-48 resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className={`text-xs text-right ${isOver ? "text-destructive font-medium" : "text-muted-foreground"}`}>
        {isOver
          ? `${Math.abs(remaining)}文字オーバーです`
          : `残り ${remaining.toLocaleString()} 文字`}
      </p>
    </div>
  );
}
