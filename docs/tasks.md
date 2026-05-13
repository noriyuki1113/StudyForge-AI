# StudyForge AI — 実装タスク一覧 (MVP)

ステータス凡例: `[ ]` 未着手 / `[~]` 進行中 / `[x]` 完了

依存タスクがすべて完了するまで着手しないこと。
並行実行可能なタスクは同じフェーズにまとめている。

---

## タスク #01 — プロジェクト初期化

**目的**
Next.js 15 + TypeScript + App Router の土台を作る。環境変数のサンプルと git 管理ルールを確立する。

**作成・変更するファイル**
```
package.json
tsconfig.json
next.config.ts
.gitignore                  # .env.local を必ず含める
.env.example                # 値は空、3変数のみ記載
app/layout.tsx              # ルートレイアウト（フォント・Toaster プレースホルダー）
app/page.tsx                # 仮のホーム（"StudyForge AI" テキストのみ）
app/globals.css
```

**完了条件**
- `npm run dev` が起動し `http://localhost:3000` でページが表示される
- `npm run build` がエラーなく完了する
- `.env.local` が `git status` で追跡されていない
- `.env.example` に `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY` の3行がある（値は空）

**依存タスク**: なし

**並行実行**: 不可（すべての起点）

---

## タスク #02 — Tailwind / shadcn/ui 設定

**目的**
Tailwind CSS v4 と shadcn/ui を初期化し、MVP で使用するコンポーネントをすべて追加する。

**作成・変更するファイル**
```
tailwind.config.ts（または CSS-first 設定）
postcss.config.mjs
app/globals.css             # Tailwind ディレクティブ・CSS 変数
components/ui/              # shadcn が生成するファイル群
  button.tsx
  input.tsx
  textarea.tsx
  tabs.tsx
  card.tsx
  toast.tsx
  toaster.tsx
  dialog.tsx
  badge.tsx
  skeleton.tsx
  progress.tsx
  separator.tsx
  label.tsx
components/providers.tsx    # Toaster をラップするクライアントプロバイダー
app/layout.tsx              # Providers を追加
```

**完了条件**
- `npx shadcn@latest init` が完了している
- 上記の shadcn コンポーネントがすべて `components/ui/` に存在する
- `app/page.tsx` に `<Button>テスト</Button>` を一時配置してスタイルが適用される
- `app/layout.tsx` に `<Toaster />` が含まれている

**依存タスク**: #01

**並行実行**: 不可（#01 完了後に着手）

---

## タスク #03 — 型定義作成

**目的**
DB テーブルと AI 生成結果の TypeScript 型を一元管理する。実装全体で `any` を使わないための基盤。

**作成・変更するファイル**
```
types/database.ts
  - Deck
  - Card
  - Quiz
  - ReviewLog
  - SourceInput

types/ai.ts
  - GeneratedCard
  - GenerateCardsResult
  - GeneratedQuiz
  - GenerateQuizResult
```

**完了条件**
- `npx tsc --noEmit` でエラーが出ない
- `Deck`, `Card`, `Quiz`, `ReviewLog`, `SourceInput` が `types/database.ts` からエクスポートされている
- `GenerateCardsResult`, `GenerateQuizResult` が `types/ai.ts` からエクスポートされている

**依存タスク**: #01

**並行実行**: 可（#02 と同時に進められる）

---

## タスク #04 — Supabase 接続設定

**目的**
ブラウザ用・サーバー用の Supabase クライアントを実装し、認証ミドルウェアで保護ルートを設定する。

**作成・変更するファイル**
```
lib/supabase/client.ts      # createBrowserClient（"use client" 用）
lib/supabase/server.ts      # createServerClient（Server Component・Route Handler 用）
middleware.ts               # セッション更新 + /generate・/decks を保護
app/auth/callback/route.ts  # メール確認コールバック
.env.local                  # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY を設定
```

**完了条件**
- `/generate` に未ログイン状態でアクセスすると `/auth/login` にリダイレクトされる
- `/decks` に未ログイン状態でアクセスすると `/auth/login` にリダイレクトされる
- `lib/supabase/server.ts` の `createClient()` が Server Component 内で呼べる
- `lib/supabase/client.ts` の `createClient()` が `"use client"` コンポーネント内で呼べる

**依存タスク**: #01, #03

**並行実行**: 可（#02・#03 と同時に進められる）

---

## タスク #05 — DB スキーマ作成

**目的**
Supabase に全テーブル・RLS ポリシー・インデックス・トリガーを作成する。

**作成・変更するファイル**
```
supabase/migrations/001_initial_schema.sql
  - decks テーブル
  - cards テーブル（deck_id で CASCADE）
  - quizzes テーブル（deck_id で CASCADE）
  - review_logs テーブル（card_id で CASCADE）
  - source_inputs テーブル（deck_id で CASCADE）
  - 各テーブルの RLS ポリシー
  - インデックス（card/quiz/review_log の deck_id・card_id・user_id）
  - updated_at 自動更新トリガー（decks・cards）
```

**完了条件**
- Supabase ダッシュボードに 5 テーブルがすべて存在する
- 各テーブルで RLS が有効になっている
- ログイン済みユーザーで `decks` テーブルへの INSERT/SELECT が成功する
- 別ユーザーのデッキを SELECT できないことを確認する
- `review_logs` への UPDATE が RLS でブロックされる

**依存タスク**: #04

**並行実行**: 不可（Supabase の実体が必要）

---

## タスク #06 — AI 生成ロジック作成

**目的**
AI プロバイダー抽象レイヤーと `generateCards` / `generateQuiz` 関数を実装する。Zod で AI レスポンスをバリデーションする。

**作成・変更するファイル**
```
lib/ai/provider.ts          # AIProvider インターフェース定義
lib/ai/anthropic.ts         # Anthropic クライアント初期化（ANTHROPIC_API_KEY を読む）
lib/ai/prompts.ts           # カード生成・クイズ生成のシステムプロンプトテンプレート
lib/ai/generate-cards.ts    # generateCards(text, cardCount?) → GenerateCardsResult
lib/ai/generate-quiz.ts     # generateQuiz(cards, quizCount?) → GenerateQuizResult
lib/fetch-url.ts            # fetchUrlText(url) → string（タイムアウト 10 秒）
lib/validators.ts           # Zod スキーマ（リクエスト入力 + AI レスポンス）
.env.local                  # ANTHROPIC_API_KEY を設定
```

**完了条件**
- `generateCards("Supabase の RLS とは...", 10)` を直接実行すると `GenerateCardsResult` が返る
- カードが 1〜10 枚の範囲で返る（AI の生成枚数が指定と一致しなくてもエラーにしない）
- Zod バリデーション失敗時に 1 回リトライし、2 回失敗でエラーをスロー
- `fetchUrlText("https://example.com")` が本文テキストを返す
- 10 秒タイムアウトが機能する
- `ANTHROPIC_API_KEY` が `lib/ai/anthropic.ts` 以外では参照されていない

**依存タスク**: #01, #03

**並行実行**: 可（#04・#05 と同時に進められる）

---

## タスク #07 — API Route 作成

**目的**
クライアントから呼ばれる Route Handler をすべて実装する。AI 呼び出し・DB 操作・認証確認をサーバー側に閉じ込める。

**作成・変更するファイル**
```
app/api/generate/from-text/route.ts
  POST: text + cardCount → generateCards → GenerateCardsResult を返す

app/api/generate/from-url/route.ts
  POST: url + cardCount → fetchUrlText → generateCards → GenerateCardsResult を返す

app/api/decks/route.ts
  POST: deckName + cards + sourceInput → decks/cards/source_inputs に INSERT → { deckId }

app/api/decks/[id]/route.ts
  GET:    decks + cards を取得
  PATCH:  deck の name/description を更新
  DELETE: deck を削除（CASCADE）

app/api/decks/[id]/cards/route.ts
  PATCH:  card の front/back を更新
  DELETE: card を削除

app/api/decks/[id]/quiz/route.ts
  GET: quizzes を取得

app/api/decks/[id]/quiz/generate/route.ts
  POST: cards を取得 → generateQuiz → quizzes に INSERT → quizzes を返す

app/api/review-logs/route.ts
  POST: cardId + result + studyMode → review_logs に INSERT
```

**完了条件**
- `POST /api/generate/from-text` に有効なテキストを送ると `{ deckName, cards }` が返る
- `POST /api/generate/from-text` に 8001 文字のテキストを送ると `400` が返る
- `POST /api/decks` を未認証で呼ぶと `401` が返る
- `POST /api/decks` を認証済みで呼ぶと `{ deckId }` が返り、DB に保存される
- `POST /api/review-logs` で `review_logs` に行が追加される
- 各エンドポイントは `try/catch` でラップされており、AI/DB エラー時に `5xx` を返す

**依存タスク**: #03, #04, #05, #06

**並行実行**: 不可（#05・#06 の完了が前提）

---

## タスク #08 — ホーム画面・認証画面作成

**目的**
ランディングページ・ダッシュボード・ログイン・サインアップ・Header を実装する。認証フロー全体を動かす。

**作成・変更するファイル**
```
app/page.tsx
  - 未ログイン: キャッチコピー・使い方 3 ステップ・「はじめる（無料）」ボタン
  - ログイン済み: 最新 5 件のデッキ一覧 + 「新しいデッキを作る」ボタン

app/auth/signup/page.tsx
components/auth/SignupForm.tsx
  - メール・パスワード・パスワード確認
  - バリデーション（パスワード 8 文字以上・一致確認）
  - Supabase signUp → 確認メール送信案内

app/auth/login/page.tsx
components/auth/LoginForm.tsx
  - メール・パスワード
  - Supabase signInWithPassword → / にリダイレクト

components/layout/Header.tsx
  - 未ログイン: ロゴ・「ログイン」「はじめる」
  - ログイン済み: ロゴ・「デッキ一覧」・「新規作成」・ログアウトボタン

components/layout/Footer.tsx
  - シンプルなコピーライト表示

hooks/useUser.ts
  - Supabase の onAuthStateChange でユーザー情報を購読
```

**完了条件**
- メールアドレスとパスワードで新規登録できる
- 確認メールのリンクでメール確認が完了し、セッションが確立される
- ログイン・ログアウトが正常に動作する
- Header がログイン状態に応じて切り替わる
- 未ログインでダッシュボードの「新しいデッキを作る」は表示されない

**依存タスク**: #02, #04

**並行実行**: 可（#07 と並行して進められる）

---

## タスク #09 — 教材入力画面作成

**目的**
`/generate` ページを実装する。テキスト入力タブと URL 入力タブを切り替え、AI 生成を呼び出す。

**作成・変更するファイル**
```
app/generate/page.tsx
  - ログイン確認（未認証なら middleware が保護済み）
  - GenerateForm を配置

app/generate/loading.tsx
  - Skeleton ローディング表示

components/generate/GenerateForm.tsx
  - タブ切り替え（テキスト / URL）
  - 「生成する」ボタン・送信制御
  - API 呼び出し → sessionStorage に保存 → /generate/review に遷移
  - 生成中: ローディングオーバーレイ「AIが重要ポイントを抽出しています...」

components/generate/TextInputTab.tsx
  - テキストエリア（最大 8,000 文字）
  - 文字数カウンター（残り文字数をリアルタイム表示）
  - 8,001 文字以上で送信ボタン無効化

components/generate/UrlInputTab.tsx
  - URL 入力フィールド
  - https:// 形式のバリデーション（インライン表示）
```

**完了条件**
- テキスト入力タブとURL入力タブが切り替えられる
- テキストを入力して「生成する」を押すと API が呼ばれローディングが表示される
- 生成成功後に `sessionStorage` に `GenerateCardsResult` が保存され `/generate/review` に遷移する
- 8,001 文字入力時に送信ボタンが無効になる
- 無効な URL を入力するとインラインエラーが表示される

**依存タスク**: #02, #07, #08

**並行実行**: 不可

---

## タスク #10 — 生成結果確認画面作成

**目的**
`/generate/review` ページを実装する。AI が生成したカードを一覧表示し、確認・編集できる状態にする。

**作成・変更するファイル**
```
app/generate/review/page.tsx
  - sessionStorage から GenerateCardsResult を読み取る
  - データがない場合は /generate にリダイレクト
  - CardReviewList・「デッキに保存する」・「やり直す」ボタンを配置

components/generate/CardReviewList.tsx
  - カード一覧のコンテナ
  - カードが 0 件になった場合の Empty State 表示

components/generate/CardReviewItem.tsx
  - カード 1 枚分の表示（表面・裏面）
  - 表示モード / 編集モードの切り替え
  - 削除ボタン（確認なしで即削除）
```

**完了条件**
- `/generate/review` を直接開くと `/generate` にリダイレクトされる
- 生成フロー経由でアクセスするとカード一覧が表示される
- カードが正しく表面・裏面に分かれて表示されている
- 「やり直す」を押すと `/generate` に戻り sessionStorage の生成結果が消える

**依存タスク**: #09

**並行実行**: 不可

---

## タスク #11 — カード編集機能

**目的**
生成結果確認画面でカードの表面・裏面を編集・削除できるようにする。デッキ詳細画面でも同様の編集機能を提供する。

**作成・変更するファイル**
```
components/generate/CardReviewItem.tsx
  - 編集モード: 表面・裏面それぞれ <Input>/<Textarea> で編集
  - 「保存」ボタンで編集内容を sessionStorage に反映
  - 「キャンセル」で元の値に戻す

components/decks/CardEditor.tsx
  - デッキ詳細ページでのカード編集 UI
  - 「保存」で PATCH /api/decks/[id]/cards を呼ぶ
  - 「削除」で DELETE /api/decks/[id]/cards を呼ぶ（確認なし）
```

**完了条件**
- 生成結果画面でカードの表面・裏面を編集して保存できる
- 編集後に「デッキに保存する」を押すと編集後の内容が DB に保存される
- デッキ詳細でカードの表面・裏面を編集して Supabase に更新できる
- デッキ詳細でカードを削除すると一覧から消える

**依存タスク**: #07, #10

**並行実行**: 不可

---

## タスク #12 — デッキ保存機能

**目的**
確認・編集後のカードを `POST /api/decks` で DB に保存し、デッキ詳細ページに遷移する。

**作成・変更するファイル**
```
app/generate/review/page.tsx
  - 「デッキに保存する」ボタンのクリックハンドラー
  - POST /api/decks を呼び出し
  - 成功後: sessionStorage をクリアして /decks/[id] に遷移
  - 失敗時: Toast でエラー表示
```

**完了条件**
- 「デッキに保存する」を押すと `decks`・`cards`・`source_inputs` テーブルに行が追加される
- 保存成功後に `/decks/[id]` に遷移する
- 保存後に sessionStorage の `generateResult` キーが削除されている
- 保存失敗時（ネットワークエラー等）に Toast で「保存に失敗しました。もう一度お試しください。」が表示される

**依存タスク**: #07, #11

**並行実行**: 不可

---

## タスク #13 — デッキ一覧・詳細画面作成

**目的**
`/decks`（一覧）と `/decks/[id]`（詳細）ページを実装する。カード一覧・デッキ名編集・デッキ削除を含む。

**作成・変更するファイル**
```
app/decks/page.tsx
  - Server Component: Supabase からデッキ一覧を取得
  - デッキが 0 件の場合の Empty State（「最初のデッキを作りましょう」+ /generate リンク）

app/decks/loading.tsx
  - Skeleton ローディング

app/decks/[id]/page.tsx
  - Server Component: デッキ・カード一覧・review_logs 集計を取得
  - 「学習する」「小テスト」ボタンを配置

components/decks/DeckList.tsx
  - デッキ一覧のコンテナ

components/decks/DeckListItem.tsx
  - デッキ名・カード枚数・作成日・直近学習日を表示
  - クリックで /decks/[id] に遷移

components/decks/DeckHeader.tsx
  - デッキ名（インライン編集可）
  - PATCH /api/decks/[id] で更新
  - デッキ削除ボタン + Dialog による確認
  - 削除後 /decks にリダイレクト

hooks/useDecks.ts
  - クライアント側でデッキ一覧を取得するフック（リフレッシュ用）
```

**完了条件**
- `/decks` にログイン済みでアクセスするとデッキ一覧が表示される
- デッキをクリックすると `/decks/[id]` に遷移する
- デッキ詳細にカード一覧が表示される
- デッキ名をインライン編集して保存できる
- 削除ダイアログを確認して削除するとデッキが消え `/decks` に戻る

**依存タスク**: #02, #07, #12

**並行実行**: 可（#12 と同時進行できる部分あり）

---

## タスク #14 — 復習画面作成（フラッシュカード・クイズ）

**目的**
`/decks/[id]/study`（フラッシュカード）と `/decks/[id]/quiz`（選択式クイズ）を実装する。

**作成・変更するファイル**
```
app/decks/[id]/study/page.tsx
  - Server Component: Supabase から cards を取得
  - Flashcard・StudyProgress を配置

app/decks/[id]/quiz/page.tsx
  - Server Component: Supabase から quizzes を取得
  - 空の場合は POST /api/decks/[id]/quiz/generate を呼び出してから表示
  - QuizQuestion を配置

components/study/Flashcard.tsx
  - "use client"
  - 表面を最初に表示
  - クリック/タップで CSS フリップアニメーション（rotateY 180deg）
  - 裏面表示後に「わかった」「もう一度」ボタンを表示

components/study/StudyProgress.tsx
  - 現在のカード番号 / 総枚数 を表示
  - shadcn Progress バー

components/study/StudySummary.tsx
  - 全カード完了後に表示
  - 正解率・正解数/総数を表示
  - 「もう一度」「デッキに戻る」ボタン

components/study/QuizQuestion.tsx
  - "use client"
  - 問題文と4つの選択肢ボタンを表示
  - 選択後に正誤フィードバックを表示（正解: 緑、不正解: 赤 + 正解表示）
  - 「次へ」ボタンで次の問題へ

components/study/QuizSummary.tsx
  - 全問終了後に表示
  - スコア・正解率・各問の正誤一覧を表示
  - 「もう一度」「デッキに戻る」ボタン
```

**完了条件**
- フラッシュカード学習で 1 枚ずつカードが表示される
- クリック/タップでカードが反転する
- 「わかった」「もう一度」ボタンが反転後に表示される
- 全カード完了後にサマリーが表示される
- クイズ画面で 5 問の 4 択問題が出題される
- 選択後に正誤フィードバックが表示される
- 全問完了後にスコアサマリーが表示される

**依存タスク**: #02, #13

**並行実行**: 不可

---

## タスク #15 — レビュー記録

**目的**
学習結果（正誤）を `review_logs` に記録する。フラッシュカードとクイズ両方に対応する。

**作成・変更するファイル**
```
components/study/Flashcard.tsx
  - 「わかった」押下: POST /api/review-logs { cardId, result: 'correct', studyMode: 'flashcard' }
  - 「もう一度」押下: POST /api/review-logs { cardId, result: 'incorrect', studyMode: 'flashcard' }

components/study/QuizQuestion.tsx
  - 選択肢を選んだ時点で POST /api/review-logs { cardId, result, studyMode: 'quiz' }
  - クイズの quiz は card_id と紐づくため、quiz.card_id をログに記録する
  ※ quiz テーブルに card_id カラムを追加する（schema の修正も含む）
```

**⚠️ スキーマ変更が必要**
`quizzes` テーブルに `card_id uuid references cards(id)` カラムを追加する。
`supabase/migrations/002_add_card_id_to_quizzes.sql` として分離する。

**完了条件**
- フラッシュカードで「わかった」を押すと `review_logs` に `result: 'correct'` の行が追加される
- フラッシュカードで「もう一度」を押すと `review_logs` に `result: 'incorrect'` の行が追加される
- クイズで選択肢を選ぶと `review_logs` に行が追加される
- Supabase ダッシュボードで `review_logs` テーブルにデータが蓄積されていることを確認できる

**依存タスク**: #07, #14

**並行実行**: 不可

---

## タスク #16 — 学習履歴の簡易表示

**目的**
デッキ詳細ページに「直近学習日時」と「直近セッションの正解率」を表示する。

**作成・変更するファイル**
```
app/decks/[id]/page.tsx
  - Server Component 内で review_logs を集計するクエリを追加
  - 集計: 直近学習日時 / 直近セッション（同日の学習）の正解率

components/decks/DeckStats.tsx（新規）
  - 直近学習日時（「2026-05-13 に学習」「まだ学習していません」）
  - 直近セッション正解率（「直近の正解率: 7 / 10（70%）」）
  - shadcn Badge でスコアをハイライト
```

**完了条件**
- デッキ詳細に「まだ学習していません」が表示される（初回時）
- フラッシュカード学習後にデッキ詳細を開くと学習日時と正解率が更新されている
- クイズ後にデッキ詳細を開くと学習日時と正解率が更新されている

**依存タスク**: #13, #15

**並行実行**: 不可

---

## タスク #17 — エラーハンドリング

**目的**
全フローのエラーシナリオに対して、spec.md に定義した日本語メッセージを表示する。`loading.tsx` / `error.tsx` を配置する。

**作成・変更するファイル**
```
app/error.tsx                 # グローバルエラー境界
app/generate/error.tsx        # 生成ページのエラー境界
app/decks/error.tsx
app/decks/[id]/error.tsx

app/generate/loading.tsx      # 生成ページのローディング（Skeleton）
app/decks/loading.tsx
app/decks/[id]/loading.tsx
app/decks/[id]/study/loading.tsx
app/decks/[id]/quiz/loading.tsx

components/generate/GenerateForm.tsx
  - API エラー時に Toast で日本語メッセージを表示（spec §10 参照）
  - テキスト超過・URL 不正のインラインバリデーション

components/auth/LoginForm.tsx
  - ログイン失敗時: 「メールアドレスまたはパスワードが正しくありません」

components/auth/SignupForm.tsx
  - 既存メール: 「このメールアドレスはすでに登録されています」
  - パスワード不一致: 「パスワードが一致しません」

components/decks/DeckHeader.tsx
  - 削除失敗時: 「削除に失敗しました。もう一度お試しください。」

components/decks/CardEditor.tsx
  - 更新失敗時: 「保存に失敗しました。」
```

**完了条件**
- `spec.md § 10` に記載された全エラーシナリオで正しい日本語メッセージが表示される
- 各ページに `loading.tsx` が存在し、データ取得中にスケルトンが表示される
- API エラー（5xx）はユーザーに具体的なスタックトレースを見せない
- ネットワーク切断時にフォームを送信するとエラー Toast が表示される

**依存タスク**: #08〜#16（全機能実装後）

**並行実行**: 不可

---

## タスク #18 — スマホ UI 調整

**目的**
iPhone SE（375px）〜 PC（1280px）でレイアウトが崩れないことを確認し、必要な修正を行う。

**作成・変更するファイル**
```
（各コンポーネントの Tailwind クラスを修正）
主な確認対象:
  components/generate/CardReviewItem.tsx  # 編集 UI が狭い画面で崩れないか
  components/study/Flashcard.tsx          # カードのサイズがスマホで適切か
  components/study/QuizQuestion.tsx       # 選択肢ボタンが 4 つ縦並びになるか
  components/layout/Header.tsx            # スマホでナビが折りたたまれるか
  app/decks/page.tsx                      # デッキ一覧がスマホで 1 カラムになるか
```

**完了条件**
- iPhone SE（375px 幅）でブラウザ DevTools のエミュレーションを使い、全 9 画面がレイアウト崩れなし
- タップターゲット（ボタン）が最低 44px × 44px 以上
- フラッシュカードのフリップ操作がタッチデバイスでも動作する
- 横スクロールが発生しない

**依存タスク**: #17

**並行実行**: 不可

---

## タスク #19 — lint / build 確認

**目的**
TypeScript の型エラー・ESLint 警告・本番ビルドエラーをすべて解消する。

**作成・変更するファイル**
```
（各ファイルの型エラー・lint エラーを修正）
tsconfig.json               # strict モードが有効であること
.eslintrc.json（または eslint.config.mjs）
```

**完了条件**
- `npx tsc --noEmit` がエラー 0 件で完了する
- `npm run lint` が警告 0 件で完了する（`no-unused-vars` 等を含む）
- `npm run build` がエラーなく完了する
- ビルド成果物で `ANTHROPIC_API_KEY` がクライアントバンドルに含まれていない（`grep` で確認）

**依存タスク**: #18

**並行実行**: 不可

---

## タスク #20 — README 作成

**目的**
新規参加者がリポジトリを clone してローカルで動かせるようにセットアップ手順を記述する。

**作成・変更するファイル**
```
README.md
  - プロジェクト概要（1 〜 2 文）
  - 技術スタック一覧
  - 前提条件（Node.js バージョン・Supabase アカウント・Anthropic API キー）
  - セットアップ手順
      1. clone
      2. npm install
      3. .env.local の設定（.env.example をコピーして値を記入）
      4. Supabase で supabase/migrations/001_initial_schema.sql を実行
      5. npm run dev
  - 主要コマンド（dev / build / lint / type-check）
  - ドキュメント一覧（docs/ 配下のリンク）
```

**完了条件**
- README の手順どおりに進めると `npm run dev` が起動する
- `.env.example` の各変数の取得方法が README に記載されている
- `docs/` 配下の 4 ファイルへのリンクが README に含まれている

**依存タスク**: #19

**並行実行**: 可（#19 と同時進行できる）

---

## 実装順序まとめ

```
#01 プロジェクト初期化
  └─ #02 Tailwind/shadcn ──┐
  └─ #03 型定義           ─┼─ 完了後 ─→ #04 Supabase接続
  └─ #06 AI生成ロジック   ─┘              └─ #05 DBスキーマ
                                            └─ (合流) #07 API Route
                                                └─ #08 ホーム・認証 ─┐
                                                └─ #09 教材入力       │
                                                    └─ #10 生成結果    │
                                                        └─ #11 編集    │
                                                            └─ #12 保存 │
                                                                └─ #13 一覧 ←┘
                                                                    └─ #14 復習
                                                                        └─ #15 記録
                                                                            └─ #16 履歴
                                                                                └─ #17 エラー
                                                                                    └─ #18 スマホ
                                                                                        └─ #19 build
                                                                                        └─ #20 README
```

**並行実行できるタスクの組み合わせ**:
- `#02`・`#03`・`#06` は `#01` 完了後に並行可
- `#05` は `#04` 完了後に着手（`#02`・`#03`・`#06` と並行可）
- `#08` は `#07` と並行可
- `#13` と `#12` は一部並行可
- `#19` と `#20` は並行可

---

## タスクステータス

| # | タスク | ステータス |
|---|--------|-----------|
| 01 | プロジェクト初期化 | `[ ]` |
| 02 | Tailwind / shadcn/ui 設定 | `[ ]` |
| 03 | 型定義作成 | `[ ]` |
| 04 | Supabase 接続設定 | `[ ]` |
| 05 | DB スキーマ作成 | `[ ]` |
| 06 | AI 生成ロジック作成 | `[ ]` |
| 07 | API Route 作成 | `[ ]` |
| 08 | ホーム・認証画面作成 | `[ ]` |
| 09 | 教材入力画面作成 | `[ ]` |
| 10 | 生成結果確認画面作成 | `[ ]` |
| 11 | カード編集機能 | `[ ]` |
| 12 | デッキ保存機能 | `[ ]` |
| 13 | デッキ一覧・詳細画面作成 | `[ ]` |
| 14 | 復習画面作成 | `[ ]` |
| 15 | レビュー記録 | `[ ]` |
| 16 | 学習履歴の簡易表示 | `[ ]` |
| 17 | エラーハンドリング | `[ ]` |
| 18 | スマホ UI 調整 | `[ ]` |
| 19 | lint / build 確認 | `[ ]` |
| 20 | README 作成 | `[ ]` |

---

*最終更新: 2026-05-13*
