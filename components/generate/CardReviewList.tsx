"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardReviewItem } from "./CardReviewItem";
import { Save, RotateCcw, BookOpen, Loader2 } from "lucide-react";
import type { GeneratedCard, GenerateCardsResult } from "@/types/ai";

interface StoredResult extends GenerateCardsResult {
  _source?: { inputType: "text" | "url"; content: string };
}

interface Props {
  initial: StoredResult;
}

type CardWithKey = GeneratedCard & { _key: string };

export function CardReviewList({ initial }: Props) {
  const router = useRouter();
  const [cards, setCards] = useState<CardWithKey[]>(() =>
    initial.cards.map((c, i) => ({ ...c, _key: `card-${i}` }))
  );
  const [deckName] = useState(initial.deckName);
  const [saving, setSaving] = useState(false);

  const handleUpdate = (key: string, updated: GeneratedCard) => {
    setCards((prev) => prev.map((c) => (c._key === key ? { ...updated, _key: key } : c)));
  };

  const handleDelete = (key: string) => {
    setCards((prev) => prev.filter((c) => c._key !== key));
  };

  const handleRedo = () => {
    sessionStorage.removeItem("generateResult");
    router.push("/generate");
  };

  const handleSave = async () => {
    if (cards.length === 0) {
      toast.error("カードが1枚もありません");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckName,
          cards: cards.map((c) => ({ front: c.front, back: c.back })),
          sourceInput: initial._source
            ? { inputType: initial._source.inputType, content: initial._source.content }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "保存に失敗しました。もう一度お試しください。");
        return;
      }

      sessionStorage.removeItem("generateResult");
      toast.success("デッキを保存しました");
      router.push(`/decks/${data.deckId}`);
    } catch {
      toast.error("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{deckName}</h2>
        <p className="text-sm text-muted-foreground">{cards.length} 枚のカードが生成されました</p>
      </div>

      {cards.length === 0 ? (
        <div className="border rounded-lg p-12 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">カードがありません</p>
          <Button variant="outline" onClick={handleRedo}>
            <RotateCcw className="mr-2 h-4 w-4" />
            やり直す
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card, i) => (
            <CardReviewItem
              key={card._key}
              card={card}
              index={i}
              cardKey={card._key}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={handleRedo} disabled={saving}>
          <RotateCcw className="mr-2 h-4 w-4" />
          やり直す
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={saving || cards.length === 0}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              デッキに保存する
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
