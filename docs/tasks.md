# StudyForge AI — タスク一覧 (MVP)

ステータス凡例: `[ ]` 未着手 / `[x]` 完了 / `[-]` スキップ（スコープ外）

---

## Phase 0: ドキュメント整備

| # | タスク | 完了条件 |
|---|--------|----------|
| 0-1 | `docs/constitution.md` 作成 | プロジェクト原則・品質基準が記述されている |
| 0-2 | `docs/spec.md` 作成 | 画面・API・DB設計・プロンプト方針が記述されている |
| 0-3 | `docs/plan.md` 作成 | ディレクトリ構成・技術的決定・環境変数が記述されている |
| 0-4 | `docs/tasks.md` 作成（このファイル） | タスクが優先順位付きで列挙されている |

**Phase 0 ステータス**: `[x]` 0-1 `[x]` 0-2 `[x]` 0-3 `[x]` 0-4

---

## Phase 1: プロジェクトセットアップ

| # | タスク | 完了条件 |
|---|--------|----------|
| 1-1 | `create-next-app` で Next.js 15 プロジェクトを作成 | TypeScript・Tailwind CSS・App Router が有効な状態で起動する |
| 1-2 | shadcn/ui を初期化 | `npx shadcn@latest init` 完了、`components/ui/` が存在する |
| 1-3 | 必要な shadcn コンポーネントを追加 | `button` `input` `textarea` `tabs` `card` `toast` `dialog` `badge` が追加されている |
| 1-4 | `.env.example` を作成・コミット | 3変数が空値で記述されている |
| 1-5 | `.env.local` を作成（git 管理外） | Supabase URL・Anon Key・Anthropic API Key が設定されている |
| 1-6 | `.gitignore` に `.env.local` が含まれていることを確認 | `git status` で `.env.local` が追跡されていない |
| 1-7 | Supabase クライアントを初期化（`lib/supabase/`） | `client.ts` / `server.ts` が実装されている |
| 1-8 | Anthropic クライアントを初期化（`lib/anthropic.ts`） | `new Anthropic()` インスタンスをエクスポートしている |
| 1-9 | `types/database.ts` と `types/generate.ts` を作成 | `Deck` `Card` `Quiz` `ReviewLog` `GeneratedCard` `GenerateResult` 型が定義されている |
| 1-10 | ルートレイアウト (`app/layout.tsx`) を実装 | フォント設定・Toaster コンポーネント・グローバル CSS が適用されている |
| 1-11 | Header コンポーネントを実装 | ロゴ・ナビゲーション（ログイン状態で切り替え）が表示される |

---

## Phase 2: 認証

| # | タスク | 完了条件 |
|---|--------|----------|
| 2-1 | Supabase でメール認証を有効化 | Supabase ダッシュボードで Email プロバイダーが ON |
| 2-2 | `middleware.ts` を実装 | `/generate` `/decks` 以下は未認証時に `/auth/login` へリダイレクトされる |
| 2-3 | `app/auth/callback/route.ts` を実装 | メール確認後のコールバックでセッションが確立される |
| 2-4 | サインアップページ (`app/auth/signup/page.tsx`) を実装 | メール・パスワードを入力して送信すると確認メール送信案内が表示される |
| 2-5 | `SignupForm` コンポーネントを実装 | バリデーション（パスワード一致確認・文字数）・エラー表示が動作する |
| 2-6 | ログインページ (`app/auth/login/page.tsx`) を実装 | メール・パスワードでログインでき、`/` にリダイレクトされる |
| 2-7 | `LoginForm` コンポーネントを実装 | エラー時に日本語メッセージが表示される |
| 2-8 | `hooks/useUser.ts` を実装 | ログインユーザーの情報を取得できる |
| 2-9 | ログアウト機能を Header に追加 | ログアウトボタンを押すとセッションが破棄され `/` に遷移する |

---

## Phase 3: カード生成

| # | タスク | 完了条件 |
|---|--------|----------|
| 3-1 | `lib/validators.ts` を実装 | テキスト文字数（max 8000）・URL形式のバリデーション関数が定義されている |
| 3-2 | `lib/fetch-url.ts` を実装 | URL を受け取り本文テキスト（8000文字以内）を返す。タイムアウト 10 秒 |
| 3-3 | `lib/generate.ts` を実装 | `generateCards(text, cardCount)` が Anthropic API を呼び出し `GenerateResult` を返す |
| 3-4 | `POST /api/generate/from-text` を実装 | テキストを受け取り `GenerateResult` を返す。入力エラー時は 400、AI エラー時は 500 |
| 3-5 | `POST /api/generate/from-url` を実装 | URL を受け取り本文取得 → カード生成 → `GenerateResult` を返す |
| 3-6 | 生成ページ (`app/generate/page.tsx`) を実装 | テキスト/URLタブ・カード枚数選択・デッキ名入力が表示される |
| 3-7 | `GenerateForm` コンポーネントを実装 | 送信時にローディング表示、成功後に結果を `sessionStorage` に保存して `/generate/review` へ遷移する |
| 3-8 | `TextInputTab` コンポーネントを実装 | テキストエリア・文字数カウンター（8000文字制限）が動作する |
| 3-9 | `UrlInputTab` コンポーネントを実装 | URLインプット・簡易フォーマット検証が動作する |
| 3-10 | 確認・編集ページ (`app/generate/review/page.tsx`) を実装 | `sessionStorage` からカード一覧を読み取り表示する。データがない場合は `/generate` にリダイレクト |
| 3-11 | `CardReviewList` コンポーネントを実装 | 各カードの表面・裏面を編集・削除できる。「保存する」「やり直す」ボタンがある |

---

## Phase 4: デッキ保存・管理

| # | タスク | 完了条件 |
|---|--------|----------|
| 4-1 | Supabase で `deck` `card` `quiz` `review_log` テーブルを作成 | `plan.md` の RLS SQL が適用され、テーブルが存在する |
| 4-2 | `POST /api/decks` を実装 | デッキとカードを DB に保存し `deckId` を返す。未認証時は 401 |
| 4-3 | `CardReviewList` の「保存する」ボタンに API 連携を追加 | 保存成功後に `/decks/[id]` へ遷移する |
| 4-4 | `hooks/useDecks.ts` を実装 | ログインユーザーのデッキ一覧を Supabase から取得する |
| 4-5 | デッキ一覧ページ (`app/decks/page.tsx`) を実装 | デッキ名・カード枚数・作成日が表示される。デッキがない場合は生成へ誘導する |
| 4-6 | `DeckList` / `DeckCard` コンポーネントを実装 | デッキカードをクリックすると `/decks/[id]` へ遷移する |
| 4-7 | デッキ詳細ページ (`app/decks/[id]/page.tsx`) を実装 | デッキ名・カード一覧・「学習する」「小テスト」ボタンが表示される |
| 4-8 | `CardEditor` コンポーネントを実装 | カードの表面・裏面をインライン編集でき、Supabase に更新・削除できる |
| 4-9 | デッキ名の編集機能を実装 | デッキ名をクリックして編集し、Supabase に保存できる |
| 4-10 | デッキ削除機能を実装 | 確認ダイアログ後にデッキ・カード・クイズが削除される |

---

## Phase 5: フラッシュカード学習

| # | タスク | 完了条件 |
|---|--------|----------|
| 5-1 | `POST /api/review-logs` を実装 | `card_id` `result` `study_mode` を受け取り `review_log` に保存する |
| 5-2 | 学習ページ (`app/decks/[id]/study/page.tsx`) を実装 | デッキのカード一覧を Supabase から取得して学習セッションを開始する |
| 5-3 | `Flashcard` コンポーネントを実装 | カードをクリック/タップで表裏がめくれる（CSS flip アニメーション） |
| 5-4 | `StudyProgress` コンポーネントを実装 | 「3 / 10」のような進捗バーが表示される |
| 5-5 | 「わかった」「もう一度」ボタンを実装 | ボタン押下で `POST /api/review-logs` を呼び出し、次のカードへ進む |
| 5-6 | 学習完了サマリーを実装 | 全カード終了後に正解率と「もう一度」「デッキに戻る」ボタンが表示される |

---

## Phase 6: 小テスト

| # | タスク | 完了条件 |
|---|--------|----------|
| 6-1 | `lib/generate.ts` に `generateQuiz(cards)` 関数を追加 | カード一覧から4択問題を生成し `Quiz[]` を返す |
| 6-2 | `POST /api/decks/[id]/quiz/generate` を実装 | カード一覧を取得 → AI で問題生成 → `quiz` テーブルに保存 → 問題一覧を返す |
| 6-3 | 小テストページ (`app/decks/[id]/quiz/page.tsx`) を実装 | `quiz` テーブルから問題を取得（なければ自動生成）して出題する |
| 6-4 | `QuizQuestion` コンポーネントを実装 | 問題文と4つの選択肢ボタンが表示される。回答後に正誤フィードバックが出る |
| 6-5 | 小テスト完了サマリーを実装 | スコア・正解率・各問の正誤一覧が表示される |
| 6-6 | 小テスト結果を `review_log` に記録 | `study_mode: 'quiz'` で `POST /api/review-logs` が呼ばれている |

---

## Phase 7: ランディングページ・仕上げ

| # | タスク | 完了条件 |
|---|--------|----------|
| 7-1 | ランディングページ (`app/page.tsx`) を実装（未ログイン） | キャッチコピー・使い方3ステップ・CTA ボタンが表示される |
| 7-2 | ダッシュボード (`app/page.tsx`) を実装（ログイン済み） | 最新5件のデッキ一覧と「新しいデッキを作る」ボタンが表示される |
| 7-3 | レスポンシブ対応を確認 | iPhone SE（375px）〜 PC（1280px）で主要画面のレイアウトが崩れない |
| 7-4 | エラー境界・Loading UI を追加 | 各ページに `loading.tsx` `error.tsx` が存在し、適切なメッセージが表示される |
| 7-5 | トースト通知を全フローに追加 | 保存成功・エラー発生時に日本語のトーストが表示される |
| 7-6 | `README.md` を作成 | ローカル開発手順・環境変数設定方法が記述されている |
| 7-7 | Vercel にデプロイ | 本番 URL でログイン〜カード生成〜学習の一連フローが動作する |

---

## MVP スコープ外（Phase 2 以降）

| タスク | 理由 |
|--------|------|
| PDF取り込み | ファイルアップロード・パース処理が複雑なため後続フェーズ |
| YouTube字幕取り込み | 字幕API連携が必要なため後続フェーズ |
| Ankiエクスポート | `.apkg` 生成ライブラリの調査が必要なため後続フェーズ |
| スペーシング復習（SM-2） | `review_log` の蓄積後に実装するため後続フェーズ |
| デッキ公開・販売（課金） | Stripe 連携が必要なため後続フェーズ |
| 学習統計ダッシュボード | データ蓄積後に意味が出るため後続フェーズ |

---

## 実装順序まとめ

```
Phase 0（完了）→ Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
  ドキュメント     セットアップ   認証        生成        保存・管理    学習        テスト      仕上げ
```

各 Phase は前の Phase が完了してから着手する。ただし Phase 5〜6 は Phase 4 完了後に並行着手可能。

---

*最終更新: 2026-05-13*
