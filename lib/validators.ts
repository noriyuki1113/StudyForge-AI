import { z } from "zod";

export const GenerateFromTextSchema = z.object({
  text: z.string().min(1, "テキストを入力してください").max(8000, "テキストは8,000文字以内にしてください"),
  cardCount: z.number().int().min(1).max(20).default(10),
  deckName: z.string().optional(),
});

export const GenerateFromUrlSchema = z.object({
  url: z.string().url("有効なURLを入力してください").regex(/^https?:\/\//i, "http または https で始まるURLを入力してください"),
  cardCount: z.number().int().min(1).max(20).default(10),
  deckName: z.string().optional(),
});

export const SaveDeckSchema = z.object({
  deckName: z.string().min(1, "デッキ名を入力してください"),
  cards: z.array(
    z.object({
      front: z.string().min(1),
      back: z.string().min(1),
    })
  ).min(1, "カードが1枚以上必要です"),
  sourceInput: z.object({
    inputType: z.enum(["text", "url"]),
    content: z.string(),
  }).optional(),
});

export const ReviewLogSchema = z.object({
  cardId: z.string().uuid(),
  result: z.enum(["correct", "incorrect"]),
  studyMode: z.enum(["flashcard", "quiz"]),
});
