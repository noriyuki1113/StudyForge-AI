"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { GeneratedCard } from "@/types/ai";

interface Props {
  card: GeneratedCard;
  index: number;
  onUpdate: (index: number, updated: GeneratedCard) => void;
  onDelete: (index: number) => void;
}

export function CardReviewItem({ card, index, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);

  const handleSave = () => {
    if (!front.trim() || !back.trim()) return;
    onUpdate(index, { front: front.trim(), back: back.trim() });
    setEditing(false);
  };

  const handleCancel = () => {
    setFront(card.front);
    setBack(card.back);
    setEditing(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground font-medium pt-0.5">
          カード {index + 1}
        </span>
        <div className="flex gap-1 shrink-0">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleSave} title="保存">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} title="キャンセル">
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)} title="編集">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(index)}
                className="text-destructive hover:text-destructive"
                title="削除"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">表面（問い）</Label>
            <Input value={front} onChange={(e) => setFront(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">裏面（答え）</Label>
            <Textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="min-h-20 resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-secondary/40 rounded p-3">
            <p className="text-xs text-muted-foreground mb-1">表面</p>
            <p className="text-sm font-medium">{card.front}</p>
          </div>
          <div className="bg-primary/5 rounded p-3">
            <p className="text-xs text-muted-foreground mb-1">裏面</p>
            <p className="text-sm whitespace-pre-wrap">{card.back}</p>
          </div>
        </div>
      )}
    </div>
  );
}
