# StudyForge AI — 機能仕様書 (MVP)

## 1. 画面一覧

| # | パス | 画面名 | 認証要否 |
|---|------|--------|----------|
| 1 | `/` | ランディング / ダッシュボード | 不要（未ログイン時はLP表示） |
| 2 | `/auth/login` | ログイン | 不要 |
| 3 | `/auth/signup` | サインアップ | 不要 |
| 4 | `/generate` | カード生成 | 必要 |
| 5 | `/generate/review` | 生成結果確認・編集 | 必要 |
| 6 | `/decks` | デッキ一覧 | 必要 |
| 7 | `/decks/[id]` | デッキ詳細 | 必要 |
| 8 | `/decks/[id]/study` | フラッシュカード学習 | 必要 |
| 9 | `/decks/[id]/quiz` | 小テスト | 必要 |

---

## 2. 画面仕様

### 2-1. ランディング / ダッシュボード (`/`)

**未ログイン時**:
- サービス説明（キャッチコピー、使い方の3ステップ）
- 「はじめる（無料）」ボタン → `/auth/signup`
- 「ログイン」リンク → `/auth/login`

**ログイン済み時**:
- 「新しいデッキを作る」ボタン → `/generate`
- 自分のデッキ一覧（最新5件）
- 各デッキへのリンク

---

### 2-2. ログイン (`/auth/login`)

- メールアドレス + パスワード入力
- Supabase Auth の `signInWithPassword` を使用
- ログイン成功 → `/` にリダイレクト
- エラー時: 「メールアドレスまたはパスワードが正しくありません」

---

### 2-3. サインアップ (`/auth/signup`)

- メールアドレス + パスワード + パスワード確認 入力
- Supabase Auth の `signUp` を使用
- 成功 → 確認メール送信の案内
- エラー時: 「このメールアドレスはすでに登録されています」等

---

### 2-4. カード生成 (`/generate`)

**入力モード（タブ切り替え）**:

| タブ | 内容 |
|------|------|
| テキスト入力 | テキストエリアに教材文を貼り付け（最大 8,000 文字） |
| URL入力 | URLを入力してWebページ本文を取得（OGP・本文抽出） |

**オプション設定**:
- 生成するカード枚数（5 / 10 / 15 / 20 枚）デフォルト: 10
- デッキ名入力（未入力時: AIが自動生成）
- 「生成する」ボタン → API 呼び出し → `/generate/review` へ遷移

**UX**:
- 生成中はローディングスピナー表示
- エラー時は画面上部にトースト通知（日本語メッセージ）

---

### 2-5. 生成結果確認・編集 (`/generate/review`)

- AIが生成したカード一覧を表示（表面・裏面）
- 各カードに対して:
  - 表面（問い）の編集
  - 裏面（答え）の編集
  - 削除
- 「デッキに保存する」ボタン → `/decks/[id]` へ遷移
- 「やり直す」ボタン → `/generate` へ戻る
- **保存前は DB に書き込まない**（セッション / URL state で保持）

---

### 2-6. デッキ一覧 (`/decks`)

- ログインユーザーのデッキ一覧
- デッキ名・カード枚数・最終学習日を表示
- 「新しいデッキを作る」ボタン → `/generate`
- 各デッキ行クリック → `/decks/[id]`

---

### 2-7. デッキ詳細 (`/decks/[id]`)

- デッキ名（編集可）
- カード一覧（表面・裏面）
- 各カードの編集・削除
- 「学習する」ボタン → `/decks/[id]/study`
- 「小テスト」ボタン → `/decks/[id]/quiz`
- デッキ削除ボタン（確認ダイアログあり）

---

### 2-8. フラッシュカード学習 (`/decks/[id]/study`)

- 1枚ずつカードを表示
- 表面（問い）→ クリック/タップで裏面（答え）をめくる
- 「わかった」「もう一度」ボタンで `review_log` に記録
- 全カード終了時: 正解率サマリー表示
- 進捗バー（例: 3/10）

---

### 2-9. 小テスト (`/decks/[id]/quiz`)

- デッキの `quiz` テーブルから問題を出題
  - 問題がない場合: AIが自動生成（API 経由）
- 4択選択式
- 全問終了時: スコア・正解率表示
- `review_log` に結果を記録

---

## 3. API Route 一覧

すべて `app/api/` 以下に配置。認証が必要なエンドポイントはサーバー側で Supabase セッションを検証する。

### `POST /api/generate/from-text`

**用途**: テキストからフラッシュカードを生成

**リクエスト**:
```json
{
  "text": "string (max 8000文字)",
  "cardCount": 10,
  "deckName": "string | null"
}
```

**レスポンス**:
```json
{
  "deckName": "string",
  "cards": [
    { "front": "string", "back": "string" }
  ]
}
```

**処理フロー**:
1. 入力バリデーション（文字数チェック）
2. Anthropic API 呼び出し（プロンプトは §5 参照）
3. JSON レスポンスをパースして返却
4. DB には保存しない

---

### `POST /api/generate/from-url`

**用途**: URLからWebページ本文を取得してフラッシュカードを生成

**リクエスト**:
```json
{
  "url": "string",
  "cardCount": 10,
  "deckName": "string | null"
}
```

**レスポンス**: `POST /api/generate/from-text` と同じ

**処理フロー**:
1. URL バリデーション（`http/https` のみ許可）
2. `fetch` でページ HTML を取得（タイムアウト: 10 秒）
3. 本文テキストを抽出（`<main>`, `<article>`, `<p>` 優先）
4. テキストを 8,000 文字に切り詰め
5. Anthropic API 呼び出し

---

### `POST /api/decks`

**用途**: デッキとカードを保存

**認証**: 必須

**リクエスト**:
```json
{
  "deckName": "string",
  "cards": [
    { "front": "string", "back": "string" }
  ]
}
```

**レスポンス**:
```json
{ "deckId": "uuid" }
```

**処理フロー**:
1. Supabase セッション検証
2. `deck` テーブルに挿入
3. `card` テーブルに一括挿入
4. `deckId` を返却

---

### `POST /api/decks/[id]/quiz/generate`

**用途**: デッキのカードから小テスト問題を生成して保存

**認証**: 必須

**リクエスト**: なし（デッキID は URL パラメータ）

**レスポンス**:
```json
{
  "quizzes": [
    {
      "question": "string",
      "choices": ["string", "string", "string", "string"],
      "answerIndex": 0
    }
  ]
}
```

---

### `POST /api/review-logs`

**用途**: 学習結果を記録

**認証**: 必須

**リクエスト**:
```json
{
  "cardId": "uuid",
  "result": "correct | incorrect",
  "studyMode": "flashcard | quiz"
}
```

**レスポンス**: `{ "ok": true }`

---

## 4. Supabase テーブル設計

### 4-1. `deck` テーブル

| カラム | 型 | 説明 |
|--------|----|------|
| `id` | `uuid` (PK) | デッキID |
| `user_id` | `uuid` (FK → auth.users) | オーナー |
| `name` | `text` | デッキ名 |
| `description` | `text \| null` | 説明（任意） |
| `is_public` | `boolean` | 公開フラグ（Phase 3 用、デフォルト false） |
| `created_at` | `timestamptz` | 作成日時 |
| `updated_at` | `timestamptz` | 更新日時 |

**RLS**:
- `SELECT`: `user_id = auth.uid()` OR `is_public = true`
- `INSERT / UPDATE / DELETE`: `user_id = auth.uid()`

---

### 4-2. `card` テーブル

| カラム | 型 | 説明 |
|--------|----|------|
| `id` | `uuid` (PK) | カードID |
| `deck_id` | `uuid` (FK → deck.id) | 所属デッキ |
| `front` | `text` | 表面（問い） |
| `back` | `text` | 裏面（答え） |
| `position` | `integer` | 表示順 |
| `created_at` | `timestamptz` | 作成日時 |
| `updated_at` | `timestamptz` | 更新日時 |

**RLS**:
- `deck` テーブルを JOIN し、`deck.user_id = auth.uid()` の場合のみ操作可

---

### 4-3. `quiz` テーブル

| カラム | 型 | 説明 |
|--------|----|------|
| `id` | `uuid` (PK) | 問題ID |
| `deck_id` | `uuid` (FK → deck.id) | 所属デッキ |
| `question` | `text` | 問題文 |
| `choices` | `text[]` | 選択肢（4つ） |
| `answer_index` | `integer` | 正解のインデックス（0-3） |
| `created_at` | `timestamptz` | 作成日時 |

**RLS**: `deck` 経由で `deck.user_id = auth.uid()`

---

### 4-4. `review_log` テーブル

| カラム | 型 | 説明 |
|--------|----|------|
| `id` | `uuid` (PK) | ログID |
| `user_id` | `uuid` (FK → auth.users) | ユーザー |
| `card_id` | `uuid` (FK → card.id) | 対象カード |
| `result` | `text` | `correct` \| `incorrect` |
| `study_mode` | `text` | `flashcard` \| `quiz` |
| `reviewed_at` | `timestamptz` | 学習日時 |

**RLS**:
- `SELECT / INSERT`: `user_id = auth.uid()`
- `UPDATE / DELETE`: 不可（ログは追記のみ）

---

### 4-5. ER 図（テキスト）

```
auth.users
  └── deck (user_id)
        ├── card (deck_id)
        │     └── review_log (card_id)
        └── quiz (deck_id)
```

---

## 5. AI生成プロンプト方針

### 5-1. カード生成プロンプト（`/api/generate/from-text`）

**設計方針**:
- System プロンプトで出力形式（JSON）を厳密に指定する
- ユーザーの教材テキストは User メッセージとして渡す
- カードは「問い → 答え」の形式にする
- 日本語で自然に読めるよう指示する
- 学習に適した粒度（1概念1カード）にするよう指示する

**System プロンプト（骨格）**:
```
あなたはITエンジニア向けの学習コンテンツ作成の専門家です。
以下のテキストから、学習効率が高いフラッシュカードを {cardCount} 枚生成してください。

ルール:
- 1枚のカードには1つの概念・事実のみを含める
- 表面（front）は「〜とは何ですか？」「〜の目的は？」のように問いの形式にする
- 裏面（back）は200文字以内で明確に答える
- 日本語で自然な文体にする（箇条書き可）
- 重要度の高いものから順に選ぶ

出力形式（JSONのみ、前後に説明文を含めない）:
{
  "deckName": "デッキ名",
  "cards": [
    { "front": "...", "back": "..." }
  ]
}
```

### 5-2. 小テスト生成プロンプト

- カード一覧（front/back）をコンテキストとして渡す
- 4択問題を生成するよう指示
- 誤答選択肢は「惜しい」ものにするよう指示（学習効果向上）
- JSON 形式で返却

---

## 6. 認証フロー

```
未ログイン
  → ランディングページ表示
  → 「はじめる」クリック → /auth/signup
  → メール確認 → /auth/login
  → ログイン成功 → / (ダッシュボード)

ログイン済みで保護ページにアクセス
  → Supabase Auth のセッションをサーバーサイドで確認
  → 未認証の場合 /auth/login にリダイレクト

APIルート
  → `createServerClient` で Supabase セッションを取得
  → `user` が null なら 401 を返す
```

**使用ライブラリ**: `@supabase/ssr`（Cookie ベースのセッション管理）

---

## 7. エラー処理方針

| シナリオ | ユーザーへの表示 |
|----------|----------------|
| AI生成に失敗（APIエラー） | 「カードの生成に失敗しました。もう一度お試しください。」 |
| URL取得に失敗（タイムアウト等） | 「URLからの情報取得に失敗しました。テキスト入力をお試しください。」 |
| URL取得に失敗（本文抽出不可） | 「このページからテキストを取得できませんでした。」 |
| 認証エラー | 「セッションが切れました。再度ログインしてください。」 |
| DB保存エラー | 「保存に失敗しました。もう一度お試しください。」 |
| 入力文字数超過 | 「テキストが長すぎます。8,000文字以内に収めてください。」 |

---

*最終更新: 2026-05-13*
