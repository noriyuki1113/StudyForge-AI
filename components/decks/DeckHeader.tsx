"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface Props {
  deckId: string;
  deckName: string;
  cardCount: number;
}

export function DeckHeader({ deckId, deckName, cardCount }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(deckName);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/decks/${deckId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("更新に失敗しました。もう一度お試しください。");
      return;
    }
    setEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("削除に失敗しました。もう一度お試しください。");
      setLoading(false);
      return;
    }
    router.push("/decks");
    router.refresh();
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-bold h-auto py-1 max-w-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSaveName} disabled={loading}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setName(deckName); setEditing(false); }}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{name}</h1>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDelete(true)}
              className="text-destructive hover:text-destructive ml-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{cardCount} 枚のカード</p>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>デッキを削除しますか？</DialogTitle>
            <DialogDescription>
              「{name}」を削除します。カード・クイズ・学習履歴もすべて削除されます。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
