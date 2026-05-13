# StudyForge AI — 技術設計書 (MVP)

---

## 1. 技術スタック

| レイヤー | 技術 | バージョン | 採用理由 |
|----------|------|-----------|----------|
| フレームワーク | Next.js (App Router) | 15.x | Server Components でデータ取得をサーバー側に閉じ込められる。API Route でAIキーを保護できる |
| 言語 | TypeScript | 5.x | 型安全。AIレスポンスのバリデーションに必須 |
| スタイリング | Tailwind CSS | 4.x | ユーティリティファーストで高速にレスポンシブUIを構築できる |
| UIコンポーネント | shadcn/ui | latest | Radix UI ベースでアクセシブル。コンポーネントをソースとしてコピーするため柔軟に調整できる |
| アイコン | Lucide React | latest | shadcn/ui とデフォルトで統一されている |
| DB / Auth | Supabase (PostgreSQL + Auth) | latest | RLS で行レベルセキュリティを担保できる。認証・DBが一体で初期コストが低い |
| AI | Anthropic Claude API | latest | 日本語品質が高い。`claude-sonnet-4-6` をデフォルトとする |
| バリデーション | Zod | latest | AI レスポンスの JSON バリデーションに使用。型推論と一体化できる |
| 認証セッション管理 | @supabase/ssr | latest | Cookie ベースのセッションで App Router と相性が良い |

---

## 2. ディレクトリ構成

```
StudyForge-AI/
│
├── app/                                # Next.js App Router
│   ├── layout.tsx                      # ルートレイアウト（フォント・Toaster）
│   ├── page.tsx                        # / ランディング or ダッシュボード
│   │
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts               # Supabase Auth メール確認コールバック
│   │
│   ├── generate/
│   │   ├── page.tsx                   # テキスト/URL入力画面
│   │   └── review/
│   │       └── page.tsx               # 生成結果確認・編集画面
│   │
│   ├── decks/
│   │   ├── page.tsx                   # デッキ一覧
│   │   └── [id]/
│   │       ├── page.tsx               # デッキ詳細
│   │       ├── study/
│   │       │   └── page.tsx           # フラッシュカード学習
│   │       └── quiz/
│   │           └── page.tsx           # 選択式クイズ
│   │
│   └── api/                           # Route Handlers（AIキーはここにのみ存在）
│       ├── generate/
│       │   ├── from-text/
│       │   │   └── route.ts           # POST: テキスト → カード生成
│       │   └── from-url/
│       │       └── route.ts           # POST: URL → テキスト取得 → カード生成
│       ├── decks/
│       │   ├── route.ts               # POST: デッキ保存
│       │   └── [id]/
│       │       ├── route.ts           # GET: デッキ取得 / PATCH: 更新 / DELETE: 削除
│       │       ├── cards/
│       │       │   └── route.ts       # GET: カード一覧 / PATCH: カード更新 / DELETE: カード削除
│       │       └── quiz/
│       │           ├── route.ts       # GET: クイズ一覧
│       │           └── generate/
│       │               └── route.ts   # POST: クイズ生成・保存
│       └── review-logs/
│           └── route.ts               # POST: 学習ログ記録
│
├── components/
│   ├── ui/                            # shadcn/ui 自動生成コンポーネント（手動編集しない）
│   │
│   ├── layout/
│   │   ├── Header.tsx                 # ナビゲーション（認証状態で切り替え）
│   │   └── Footer.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   │
│   ├── generate/
│   │   ├── GenerateForm.tsx           # タブ切り替え・送信制御の親コンポーネント
│   │   ├── TextInputTab.tsx           # テキストエリア + 文字数カウンター
│   │   ├── UrlInputTab.tsx            # URL入力フォーム
│   │   ├── CardReviewList.tsx         # 生成結果一覧（確認・編集用）
│   │   └── CardReviewItem.tsx         # カード1枚分の編集UI
│   │
│   ├── decks/
│   │   ├── DeckList.tsx               # デッキ一覧
│   │   ├── DeckListItem.tsx           # デッキ1件分のカード
│   │   ├── DeckHeader.tsx             # デッキ名・統計・アクションボタン
│   │   └── CardEditor.tsx             # デッキ詳細でのカード編集
│   │
│   └── study/
│       ├── Flashcard.tsx              # CSSフリップアニメーション付きカード
│       ├── StudyProgress.tsx          # 進捗バー（x / n）
│       ├── StudySummary.tsx           # 学習完了サマリー
│       ├── QuizQuestion.tsx           # 4択問題表示
│       └── QuizSummary.tsx            # クイズ完了サマリー
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # ブラウザ用クライアント（"use client" 用）
│   │   └── server.ts                  # サーバー用クライアント（Server Component・Route Handler 用）
│   │
│   ├── ai/
│   │   ├── provider.ts                # AIプロバイダー抽象レイヤー（差し替え可能）
│   │   ├── anthropic.ts               # Anthropic 実装
│   │   ├── generate-cards.ts          # generateCards 関数
│   │   ├── generate-quiz.ts           # generateQuiz 関数
│   │   └── prompts.ts                 # プロンプトテンプレート
│   │
│   ├── fetch-url.ts                   # URLからテキスト抽出
│   └── validators.ts                  # 入力バリデーション（Zod スキーマ）
│
├── types/
│   ├── database.ts                    # DBテーブルの TypeScript 型
│   └── ai.ts                          # AI生成結果の型
│
├── hooks/
│   ├── useUser.ts                     # 認証ユーザー取得（クライアント用）
│   └── useDecks.ts                    # デッキ一覧取得
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql     # テーブル作成 + RLS ポリシー
│   └── seed.sql                       # 開発用サンプルデータ（任意）
│
├── middleware.ts                      # 認証ガード
├── .env.local                         # シークレット（git 管理外）
├── .env.example                       # サンプル（git 管理対象）
└── docs/                              # 設計ドキュメント
```

---

## 3. データベース設計

### 3-1. テーブル一覧

| テーブル名 | 役割 |
|------------|------|
| `decks` | ユーザーが作成したデッキ |
| `cards` | デッキに属するフラッシュカード |
| `quizzes` | デッキに属する選択式クイズ問題 |
| `review_logs` | 学習履歴（フラッシュカード・クイズの結果） |
| `source_inputs` | 生成元の入力情報（テキスト/URL）。将来の再生成・ログ用 |

### 3-2. DDL（`supabase/migrations/001_initial_schema.sql`）

```sql
-- decks
create table decks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- cards
create table cards (
  id         uuid primary key default gen_random_uuid(),
  deck_id    uuid not null references decks(id) on delete cascade,
  front      text not null,
  back       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- quizzes
create table quizzes (
  id           uuid primary key default gen_random_uuid(),
  deck_id      uuid not null references decks(id) on delete cascade,
  question     text not null,
  choices      text[] not null,
  answer_index integer not null check (answer_index between 0 and 3),
  created_at   timestamptz not null default now()
);

-- review_logs
create table review_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_id     uuid not null references cards(id) on delete cascade,
  result      text not null check (result in ('correct', 'incorrect')),
  study_mode  text not null check (study_mode in ('flashcard', 'quiz')),
  reviewed_at timestamptz not null default now()
);

-- source_inputs（生成元の記録。再生成・デバッグ用）
create table source_inputs (
  id           uuid primary key default gen_random_uuid(),
  deck_id      uuid not null references decks(id) on delete cascade,
  input_type   text not null check (input_type in ('text', 'url')),
  content      text not null,  -- テキストの場合は本文、URLの場合はURL文字列
  created_at   timestamptz not null default now()
);
```

### 3-3. RLS ポリシー

```sql
-- decks
alter table decks enable row level security;

create policy "decks: owner full access"
  on decks for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "decks: public read"
  on decks for select
  using (is_public = true);

-- cards
alter table cards enable row level security;

create policy "cards: access through deck ownership"
  on cards for all
  using (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
        and decks.user_id = auth.uid()
    )
  );

-- quizzes
alter table quizzes enable row level security;

create policy "quizzes: access through deck ownership"
  on quizzes for all
  using (
    exists (
      select 1 from decks
      where decks.id = quizzes.deck_id
        and decks.user_id = auth.uid()
    )
  );

-- review_logs（追記専用: UPDATE・DELETE は不可）
alter table review_logs enable row level security;

create policy "review_logs: owner select"
  on review_logs for select
  using (user_id = auth.uid());

create policy "review_logs: owner insert"
  on review_logs for insert
  with check (user_id = auth.uid());

-- source_inputs
alter table source_inputs enable row level security;

create policy "source_inputs: access through deck ownership"
  on source_inputs for all
  using (
    exists (
      select 1 from decks
      where decks.id = source_inputs.deck_id
        and decks.user_id = auth.uid()
    )
  );
```

### 3-4. インデックス

```sql
create index idx_cards_deck_id       on cards(deck_id);
create index idx_quizzes_deck_id     on quizzes(deck_id);
create index idx_review_logs_card_id on review_logs(card_id);
create index idx_review_logs_user_id on review_logs(user_id);
create index idx_source_inputs_deck  on source_inputs(deck_id);
```

### 3-5. `updated_at` 自動更新トリガー

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_decks_updated_at
  before update on decks
  for each row execute function update_updated_at();

create trigger trg_cards_updated_at
  before update on cards
  for each row execute function update_updated_at();
```

---

## 4. AI 設計

### 4-1. プロバイダー抽象レイヤー（`lib/ai/provider.ts`）

AIプロバイダーを将来差し替えられるようにインターフェースで抽象化する。

```ts
export interface AIProvider {
  generateCards(text: string, cardCount: number): Promise<GenerateCardsResult>
  generateQuiz(cards: CardInput[], quizCount: number): Promise<GenerateQuizResult>
}
```

MVP では `AnthropicProvider`（`lib/ai/anthropic.ts`）のみ実装する。
OpenAI 等への切り替えが必要になった場合は `provider.ts` の実装を差し替えるだけでよい。

### 4-2. `generateCards` 関数（`lib/ai/generate-cards.ts`）

```ts
export async function generateCards(
  text: string,
  cardCount: number = 10
): Promise<GenerateCardsResult>
```

**処理フロー**:
1. `lib/ai/prompts.ts` からシステムプロンプトを取得
2. Anthropic API を呼び出す（`claude-sonnet-4-6`, `max_tokens: 2000`）
3. レスポンステキストを `JSON.parse` する
4. Zod スキーマでバリデーション（下記参照）
5. バリデーション失敗 → 1回リトライ
6. 2回失敗 → エラーをスロー

**Zod スキーマ**:

```ts
const GenerateCardsSchema = z.object({
  deckName: z.string().min(1),
  cards: z.array(
    z.object({
      front: z.string().min(1),
      back: z.string().min(1).max(400),
    })
  ).min(1),
})
```

### 4-3. `generateQuiz` 関数（`lib/ai/generate-quiz.ts`）

```ts
export async function generateQuiz(
  cards: Array<{ front: string; back: string }>,
  quizCount: number = 5
): Promise<GenerateQuizResult>
```

**Zod スキーマ**:

```ts
const GenerateQuizSchema = z.object({
  quizzes: z.array(
    z.object({
      question: z.string().min(1),
      choices: z.array(z.string().min(1)).length(4),
      answer_index: z.number().int().min(0).max(3),
    })
  ).min(1),
})
```

### 4-4. プロンプトテンプレート（`lib/ai/prompts.ts`）

**カード生成 System プロンプト**:

```
あなたはITエンジニア向けの学習コンテンツ作成の専門家です。
以下のテキストを読み、学習効率が高いフラッシュカードを {cardCount} 枚生成してください。

【カード生成ルール】
- 1枚のカードには1つの概念・事実のみを含める
- front（表面）は問いの形式にする（例:「〜とは何ですか？」「〜の役割は？」「〜するには？」）
- back（裏面）は200文字以内で明確・簡潔に答える（箇条書き可）
- 重要度の高いものから順に選ぶ
- 日本語で自然な文体にする

【出力形式】
JSON のみを出力する。コードフェンス（```）や説明文を含めないこと。

{
  "deckName": "テキストの主題を表す簡潔なデッキ名（〜入門、〜ガイドなど）",
  "cards": [
    { "front": "問い", "back": "答え" }
  ]
}
```

**クイズ生成 System プロンプト**:

```
あなたはITエンジニア向けの学習コンテンツ作成の専門家です。
以下のフラッシュカード一覧を元に、4択選択式クイズを {quizCount} 問生成してください。

【クイズ生成ルール】
- 問題文はカードの front（問い）またはそれを変形した内容にする
- 正解はカードの back（答え）の内容から作る
- 誤答選択肢は「惜しい・紛らわしい」内容にして学習効果を高める
- answer_index は 0〜3 に均等に分散させる（全問0番が正解にならないこと）
- 重複する問題は生成しない
- 日本語で自然な文体にする

【出力形式】
JSON のみを出力する。コードフェンスや説明文を含めないこと。

{
  "quizzes": [
    {
      "question": "問題文",
      "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "answer_index": 0
    }
  ]
}
```

### 4-5. 使用モデル・パラメータ

| 用途 | モデル | max_tokens |
|------|--------|-----------|
| カード生成 | `claude-sonnet-4-6` | 2000 |
| クイズ生成 | `claude-sonnet-4-6` | 1500 |

---

## 5. Backend 設計（Route Handlers）

### 5-1. API エンドポイント一覧

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| `POST` | `/api/generate/from-text` | 不要 | テキスト → カード生成 |
| `POST` | `/api/generate/from-url` | 不要 | URL → テキスト抽出 → カード生成 |
| `POST` | `/api/decks` | 必須 | デッキ・カード・source_input を保存 |
| `GET` | `/api/decks/[id]` | 必須 | デッキ詳細取得 |
| `PATCH` | `/api/decks/[id]` | 必須 | デッキ名・説明を更新 |
| `DELETE` | `/api/decks/[id]` | 必須 | デッキ削除（CASCADE） |
| `PATCH` | `/api/decks/[id]/cards` | 必須 | カードの表面・裏面を更新 |
| `DELETE` | `/api/decks/[id]/cards` | 必須 | カード削除 |
| `GET` | `/api/decks/[id]/quiz` | 必須 | クイズ一覧取得 |
| `POST` | `/api/decks/[id]/quiz/generate` | 必須 | クイズ生成・保存 |
| `POST` | `/api/review-logs` | 必須 | 学習ログ記録 |

### 5-2. 共通処理方針

- 認証が必要なエンドポイントは `lib/supabase/server.ts` でセッションを検証し、`user` が null なら `401` を返す
- リクエストボディは Zod でバリデーションし、不正な場合は `400` を返す
- DB 操作エラーは `500` を返し、エラーの詳細はサーバーログに記録してクライアントには返さない
- AI 呼び出しは必ず `try/catch` で囲み、失敗時は `502` を返す

### 5-3. URL フェッチ設計（`lib/fetch-url.ts`）

```ts
export async function fetchUrlText(url: string): Promise<string>
```

**処理**:
1. `http://` または `https://` 以外は例外をスロー
2. `AbortController` でタイムアウト 10 秒を設定してフェッチ
3. `content-type` が `text/html` 以外は例外をスロー（JSONやバイナリは対象外）
4. HTML から `<main>`, `<article>`, `<p>` の順でテキストを抽出
5. 抽出テキストが空の場合は例外をスロー
6. 8,000 文字に切り詰めて返す

---

## 6. UI 設計方針

### 6-1. スマホ優先

- Tailwind CSS の `sm:` ブレークポイントを基準に設計
- タップターゲットは最小 44×44px（Apple HIG 準拠）
- フラッシュカードのめくり操作はクリックとタッチ両対応
- 入力フォームはモバイルキーボードで快適に使えるよう `inputmode` 属性を設定

### 6-2. Loading / Error / Empty State

各インタラクティブなコンポーネントに3つの状態を必ず実装する。

| 状態 | 実装方針 |
|------|----------|
| **Loading** | shadcn/ui の `Skeleton` または スピナーを表示。生成中は「AIが重要ポイントを抽出中...」等のメッセージを添える |
| **Error** | shadcn/ui の `Toast`（API エラー）または インラインメッセージ（バリデーションエラー）。再試行できるボタンを添える |
| **Empty** | デッキ一覧が空なら「まだデッキがありません。最初のデッキを作りましょう」+ 生成ページへのリンク |

### 6-3. 入力 → 生成 → 確認 → 保存 → 復習 の画面遷移

```
/generate          →（生成完了）→   /generate/review   →（保存完了）→   /decks/[id]
 入力画面                             確認・編集画面                       デッキ詳細
   │                                       │
   │（やり直す）←────────────────────────────┘
   │
   ↓（生成中）
 ローディングオーバーレイ
 「AIが重要ポイントを抽出しています...」
```

フローの各段階でユーザーが「今どこにいるか」を把握できるよう、ステップインジケーター（1. 入力 → 2. 確認 → 3. 保存）をページ上部に表示する。

### 6-4. フラッシュカードのめくり実装

```
[表面を表示]
     ↓ クリック/タップ
[裏面を表示] + [わかった] [もう一度] ボタン
     ↓ ボタン押下
[次のカードへ or サマリー]
```

CSS の `transform-style: preserve-3d` + `rotateY(180deg)` でフリップアニメーションを実装。`"use client"` コンポーネント。

### 6-5. shadcn/ui コンポーネント使用計画

| shadcn コンポーネント | 使用箇所 |
|----------------------|----------|
| `Button` | 全フォームのCTAボタン |
| `Input` | ログイン・サインアップ・URL入力 |
| `Textarea` | テキスト入力タブ |
| `Tabs` | テキスト/URLタブ切り替え |
| `Card` | デッキ一覧カード・フラッシュカード |
| `Toast` / `Toaster` | API エラー・保存成功通知 |
| `Dialog` | デッキ削除確認ダイアログ |
| `Badge` | カード枚数・正解率バッジ |
| `Skeleton` | ローディング状態 |
| `Progress` | 学習進捗バー |
| `Separator` | セクション区切り |

---

## 7. 型定義

### `types/database.ts`

```ts
export type Deck = {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type Card = {
  id: string
  deck_id: string
  front: string
  back: string
  position: number
  created_at: string
  updated_at: string
}

export type Quiz = {
  id: string
  deck_id: string
  question: string
  choices: string[]
  answer_index: number
  created_at: string
}

export type ReviewLog = {
  id: string
  user_id: string
  card_id: string
  result: 'correct' | 'incorrect'
  study_mode: 'flashcard' | 'quiz'
  reviewed_at: string
}

export type SourceInput = {
  id: string
  deck_id: string
  input_type: 'text' | 'url'
  content: string
  created_at: string
}
```

### `types/ai.ts`

```ts
export type GeneratedCard = {
  front: string
  back: string
}

export type GenerateCardsResult = {
  deckName: string
  cards: GeneratedCard[]
}

export type GeneratedQuiz = {
  question: string
  choices: [string, string, string, string]
  answer_index: 0 | 1 | 2 | 3
}

export type GenerateQuizResult = {
  quizzes: GeneratedQuiz[]
}
```

---

## 8. Supabase クライアント初期化

### `lib/supabase/client.ts`（ブラウザ用）

```ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

使用場所: `"use client"` コンポーネント、`hooks/`

### `lib/supabase/server.ts`（サーバー用）

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

使用場所: Server Components、Route Handlers

---

## 9. 環境変数

### `.env.example`（git 管理対象）

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Anthropic Claude API
ANTHROPIC_API_KEY=
```

### 可視性ルール

| 変数名 | ブラウザ公開 | 用途 |
|--------|------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 公開（意図的） | Supabase プロジェクト URL。RLS で保護されるため問題なし |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 公開（意図的） | 匿名キー。RLS が有効なら漏洩しても被害は限定的 |
| `ANTHROPIC_API_KEY` | **非公開** | Route Handler 内でのみ使用。`NEXT_PUBLIC_` を絶対に付けない |

---

## 10. 認証・ミドルウェア設計

### `middleware.ts`

```ts
// 保護パス: 未ログインなら /auth/login にリダイレクト
const protectedPaths = ['/generate', '/decks']
```

- すべてのリクエストで `updateSession`（Cookie のリフレッシュ）を実行
- 保護パスにマッチした場合のみセッションチェック → 未認証なら `/auth/login?redirectTo=元のパス` にリダイレクト
- API Route（`/api/`）はミドルウェアで保護しない。各 Route Handler 内でセッション確認する

---

## 11. データフロー

### カード生成

```
[ブラウザ: /generate]
  │  POST /api/generate/from-text  or  /api/generate/from-url
  ▼
[Route Handler]
  ├─ (URL の場合) lib/fetch-url.ts → HTML フェッチ → テキスト抽出
  ├─ lib/ai/generate-cards.ts → Anthropic API 呼び出し
  ├─ Zod でレスポンスバリデーション
  └─ GenerateCardsResult を返す
  ▼
[ブラウザ]
  ├─ sessionStorage に GenerateCardsResult を保存
  └─ /generate/review に遷移

[ブラウザ: /generate/review]
  ├─ sessionStorage から読み取り → カード一覧表示
  ├─ ユーザーが確認・編集
  └─ 「保存する」→ POST /api/decks
       ▼
  [Route Handler: POST /api/decks]
    ├─ セッション確認（未認証 → 401）
    ├─ decks テーブルに INSERT
    ├─ cards テーブルに bulk INSERT
    ├─ source_inputs テーブルに INSERT
    └─ { deckId } を返す
       ▼
  [ブラウザ] → /decks/[id] に遷移
```

### 学習・クイズ

```
[/decks/[id]/study]
  ├─ Server Component: Supabase から cards 取得
  ├─ Flashcard コンポーネントで 1 枚ずつ表示
  └─ 「わかった」「もう一度」→ POST /api/review-logs

[/decks/[id]/quiz]
  ├─ Server Component: Supabase から quizzes 取得
  │   └─ (空の場合) POST /api/decks/[id]/quiz/generate
  │        ├─ cards 取得
  │        ├─ lib/ai/generate-quiz.ts → Anthropic API
  │        ├─ Zod バリデーション
  │        └─ quizzes テーブルに INSERT
  └─ QuizQuestion コンポーネントで 5 問表示
       └─ 回答後 → POST /api/review-logs
```

---

## 12. 依存パッケージ

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0",
    "@anthropic-ai/sdk": "^0",
    "lucide-react": "latest",
    "zod": "^3",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "class-variance-authority": "^0"
  },
  "devDependencies": {
    "typescript": "5.x",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4"
  }
}
```

shadcn/ui は `npx shadcn@latest init` でセットアップし、使用コンポーネントを都度追加する（`package.json` には直接現れない）。

---

## 13. MVP 対象外の設計（記録のみ）

以下は MVP に含めない。設計への影響が出ないよう `is_public` カラム等で拡張余地のみ確保している。

| 機能 | 将来の追加方法 |
|------|--------------|
| PDF 取り込み | `source_inputs.input_type` に `'pdf'` を追加。PDF パース処理を `lib/fetch-pdf.ts` に追加 |
| YouTube 字幕 | `source_inputs.input_type` に `'youtube'` を追加。字幕取得を `lib/fetch-youtube.ts` に追加 |
| Anki エクスポート | `decks` からカードを読み取る専用 Route Handler と `.apkg` 生成ライブラリを追加 |
| 課金・デッキ販売 | `decks.is_public = true` + `decks.price` カラム追加 + Stripe 連携 |
| 高度な間隔反復 | `review_logs` の蓄積データを元に SM-2 アルゴリズムを `lib/spaced-repetition.ts` として追加 |

---

*最終更新: 2026-05-13*
