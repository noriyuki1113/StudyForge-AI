"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { Card } from "@/types/database";

interface Props {
  card: Card;
  deckId: string;
  onUpdated: (updated: Card) => void;
  onDeleted: (id: string) => void;
}

export function CardEditor({ card, deckId, onUpdated, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/decks/${deckId}/cards`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id, front: front.trim(), back: back.trim() }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("保存に失敗しました。");
      return;
    }
    onUpdated({ ...card, front: front.trim(), back: back.trim() });
    setEditing(false);
  };

  const handleCancel = () => {
    setFront(card.front);
    setBack(card.back);
    setEditing(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/decks/${deckId}/cards`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("削除に失敗しました。");
      return;
    }
    onDeleted(card.id);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">カード</span>
        <div className="flex gap-1 shrink-0">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleSave} disabled={loading}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} disabled={loading}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <Input value={front} onChange={(e) => setFront(e.target.value)} placeholder="表面（問い）" />
          <Textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="min-h-20 resize-none"
            placeholder="裏面（答え）"
          />
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
