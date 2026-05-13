# StudyForge AI — 設計方針書 (MVP)

## 1. ディレクトリ構成

```
StudyForge-AI/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # ルートレイアウト（フォント・プロバイダー）
│   ├── page.tsx                  # ランディング / ダッシュボード (/)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts     # Supabase Auth コールバック処理
│   ├── generate/
│   │   ├── page.tsx              # カード生成入力 (/generate)
│   │   └── review/page.tsx       # 生成結果確認・編集 (/generate/review)
│   ├── decks/
│   │   ├── page.tsx              # デッキ一覧 (/decks)
│   │   └── [id]/
│   │       ├── page.tsx          # デッキ詳細 (/decks/[id])
│   │       ├── study/page.tsx    # フラッシュカード学習
│   │       └── quiz/page.tsx     # 小テスト
│   └── api/
│       ├── generate/
│       │   ├── from-text/route.ts
│       │   └── from-url/route.ts
│       ├── decks/
│       │   ├── route.ts          # POST /api/decks
│       │   └── [id]/
│       │       └── quiz/
│       │           └── generate/route.ts
│       └── review-logs/
│           └── route.ts
│
├── components/
│   ├── ui/                       # shadcn/ui が生成するコンポーネント
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── generate/
│   │   ├── GenerateForm.tsx      # テキスト/URLタブ切り替え
│   │   ├── TextInputTab.tsx
│   │   ├── UrlInputTab.tsx
│   │   └── CardReviewList.tsx    # 生成結果の確認・編集UI
│   ├── decks/
│   │   ├── DeckList.tsx
│   │   ├── DeckCard.tsx          # デッキ一覧の各カード
│   │   └── CardEditor.tsx        # カード編集フォーム
│   └── study/
│       ├── Flashcard.tsx         # めくり動作付きカード
│       ├── StudyProgress.tsx     # 進捗バー
│       └── QuizQuestion.tsx      # 4択問題表示
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # ブラウザ用 Supabase クライアント
│   │   ├── server.ts             # サーバー用 Supabase クライアント
│   │   └── middleware.ts         # セッション更新ミドルウェア
│   ├── anthropic.ts              # Anthropic クライアント初期化
│   ├── generate.ts               # カード生成ロジック（プロンプト構築）
│   ├── fetch-url.ts              # URLからテキスト抽出
│   └── validators.ts             # 入力バリデーション関数
│
├── types/
│   ├── database.ts               # Supabase テーブルの型定義
│   └── generate.ts               # 生成結果の型定義
│
├── hooks/
│   ├── useUser.ts                # 認証ユーザー取得
│   └── useDecks.ts               # デッキ一覧取得
│
├── middleware.ts                 # 認証ガード（保護ルートへのアクセス制御）
├── .env.local                    # 環境変数（git 管理外）
├── .env.example                  # 環境変数のサンプル（git 管理対象）
└── docs/                         # 設計ドキュメント
```

---

## 2. 主要な技術的決定

### 2-1. Next.js App Router を採用する

**理由**:
- Server Components によりデータ取得をサーバー側に閉じ込められる
- API Routes が同一リポジトリに置けるため、Claude API キーをフロントに露出させない
- Supabase の `@supabase/ssr` が App Router に対応している

**決定**: ページコンポーネントは基本的に Server Component。インタラクションが必要な箇所のみ `"use client"` を付与する。

---

### 2-2. 生成結果はセッションストレージで一時保持する

**理由**:
- `/generate` でAIが生成した結果を、ユーザーが確認・編集してから保存する（憲法原則 6）
- 保存前に DB に書き込まない
- ページリロードで消えてもよい（再生成できる）

**決定**: `sessionStorage` に JSON として保持し、`/generate/review` で読み取る。`useRouter.push` ではなく `router.push('/generate/review')` の前に `sessionStorage.setItem` する。

---

### 2-3. AIの呼び出しは必ず API Route 経由にする

**理由**:
- Anthropic API キーをブラウザに露出させないため（憲法原則 9）
- レスポンスのパース・バリデーションをサーバー側で行うため

**決定**: `lib/generate.ts` にプロンプト構築ロジックを置き、`app/api/generate/` から呼び出す。クライアントサイドから直接 Anthropic API を叩くコードは書かない。

---

### 2-4. URLからのテキスト抽出はサーバーサイドのみで行う

**理由**:
- CORS の問題を回避するため
- クライアントからの任意 URL フェッチはセキュリティリスクになるため

**決定**: `app/api/generate/from-url/route.ts` でサーバーサイドの `fetch` を使う。ホワイトリスト制限はせず、`http/https` のみ許可するバリデーションにとどめる（MVP）。

---

### 2-5. shadcn/ui のコンポーネントをそのまま使う

**理由**:
- 一貫したデザインシステムを低コストで維持できる
- Radix UI ベースのためアクセシビリティが担保されている

**決定**: `components/ui/` は shadcn の自動生成ファイルを置く場所とし、手動で編集しない。独自コンポーネントは `components/generate/`, `components/study/` 等に分ける。

---

### 2-6. Supabase RLS を必ず有効にする

**理由**:
- Service Role Key を使えば RLS をバイパスできるが、バグ時にデータ漏洩リスクがある
- API Route では `createServerClient`（anon key + Cookie セッション）を使い、RLS に従う

**決定**:
- すべてのテーブルで RLS を有効化
- API Route では Service Role Key を使わず、ユーザーセッションのクライアントを使う
- Admin 操作が必要な場合のみ Service Role Key を使用し、その箇所を明示的にコメントする

---

### 2-7. TypeScript の型を `types/` で一元管理する

`types/database.ts` に Supabase テーブルの行型を定義する:

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
```

`types/generate.ts` に生成結果の型:

```ts
export type GeneratedCard = {
  front: string
  back: string
}

export type GenerateResult = {
  deckName: string
  cards: GeneratedCard[]
}
```

---

## 3. 環境変数

### `.env.local`（git 管理外）

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

### `.env.example`（git 管理対象・値は空）

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

### 変数の可視性ルール

| 変数名 | ブラウザから見えるか | 用途 |
|--------|---------------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 見える | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 見える | 匿名クライアント（RLS で保護） |
| `ANTHROPIC_API_KEY` | **見えない** | Claude API 呼び出し（API Route のみ） |

`ANTHROPIC_API_KEY` は `NEXT_PUBLIC_` プレフィックスを付けてはいけない。

---

## 4. Supabase 初期化方針

### 4-1. ブラウザ用クライアント (`lib/supabase/client.ts`)

```ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

使用場所: `"use client"` コンポーネント、`hooks/`

---

### 4-2. サーバー用クライアント (`lib/supabase/server.ts`)

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

使用場所: Server Components, API Routes

---

### 4-3. ミドルウェア (`middleware.ts`)

- すべてのリクエストでセッションの Cookie を更新する
- `/generate`, `/decks` 以下は未認証時に `/auth/login` へリダイレクト

```ts
// 保護するパスのパターン
const protectedPaths = ['/generate', '/decks']
```

---

### 4-4. RLS ポリシー SQL（マイグレーション用）

```sql
-- deck テーブル
alter table deck enable row level security;

create policy "users can manage own decks"
  on deck for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "public decks are readable by all"
  on deck for select
  using (is_public = true);

-- card テーブル
alter table card enable row level security;

create policy "users can manage cards in own decks"
  on card for all
  using (
    exists (
      select 1 from deck
      where deck.id = card.deck_id
        and deck.user_id = auth.uid()
    )
  );

-- quiz テーブル（card と同様）
alter table quiz enable row level security;

create policy "users can manage quizzes in own decks"
  on quiz for all
  using (
    exists (
      select 1 from deck
      where deck.id = quiz.deck_id
        and deck.user_id = auth.uid()
    )
  );

-- review_log テーブル
alter table review_log enable row level security;

create policy "users can insert and read own review logs"
  on review_log for select
  using (user_id = auth.uid());

create policy "users can insert review logs"
  on review_log for insert
  with check (user_id = auth.uid());
```

---

## 5. データフロー図

### カード生成フロー

```
ブラウザ
  │
  ├─ POST /api/generate/from-text  (テキスト入力の場合)
  │    └─ lib/generate.ts → Anthropic API → JSON パース → レスポンス
  │
  └─ POST /api/generate/from-url  (URL入力の場合)
       └─ lib/fetch-url.ts (テキスト抽出)
            └─ lib/generate.ts → Anthropic API → JSON パース → レスポンス

ブラウザ (受信後)
  └─ sessionStorage に保存 → /generate/review へ遷移

/generate/review
  └─ sessionStorage から読み取り → ユーザーが確認・編集
       └─ 「保存」ボタン → POST /api/decks → DB保存 → /decks/[id]
```

### 学習フロー

```
/decks/[id]/study
  └─ Supabase から card 一覧を取得
       └─ 1枚ずつ表示 → 「わかった」/「もう一度」
            └─ POST /api/review-logs → review_log に記録

/decks/[id]/quiz
  └─ Supabase から quiz 一覧を取得
       │  (なければ) POST /api/decks/[id]/quiz/generate → Anthropic API → 保存
       └─ 4択問題を出題 → 回答
            └─ POST /api/review-logs → review_log に記録
```

---

## 6. 依存パッケージ（予定）

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "typescript": "5.x",
    "@supabase/supabase-js": "latest",
    "@supabase/ssr": "latest",
    "@anthropic-ai/sdk": "latest",
    "tailwindcss": "4.x",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "lucide-react": "latest",
    "zod": "latest"
  }
}
```

**shadcn/ui** は `npx shadcn@latest init` でセットアップ後、必要なコンポーネントを都度追加する。

---

*最終更新: 2026-05-13*
