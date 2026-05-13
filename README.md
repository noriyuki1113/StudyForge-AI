# StudyForge AI

IT学習向けフラッシュカード自動生成アプリ。テキストまたはURLを入力するとAIがカードを生成し、フラッシュカード学習・小テストで復習できます。

**現在のバージョン: v0.1.0 MVP**

---

## MVP v0.1.0 完了

**リリース日: 2026-05-13**

### 実装済み機能

| # | 機能 | 概要 |
|---|---|---|
| 1 | テキスト入力 | 最大8,000文字のテキストからカード生成 |
| 2 | URL入力 | ページ本文を自動取得してカード生成 |
| 3 | AI カード生成 | Claude claude-sonnet-4-6 で10枚のフラッシュカードを生成 |
| 4 | 生成結果確認・編集 | 保存前にカードの表面・裏面を修正・削除 |
| 5 | デッキ保存 | カードをデッキ単位でデータベースに保存 |
| 6 | デッキ一覧・詳細 | 保存済みデッキの閲覧・カード編集・デッキ削除 |
| 7 | フラッシュカード学習 | タップで反転、「わかった／もう一度」で進行 |
| 8 | 小テスト | AIが生成した4択問題を5問出題 |
| 9 | 学習記録 | 正解・不正解をデータベースに記録 |
| 10 | 学習履歴表示 | デッキ詳細に直近30件の正答率と最終学習日を表示 |
| 11 | メール認証 | メール＋パスワードによるサインアップ・ログイン |

### MVP スコープ外（意図的に未対応）

以下は設計段階から除外しています。今後のフェーズで実装予定です。

- PDFアップロード
- YouTube動画解析
- 課金・サブスクリプション
- Ankiエクスポート
- 高度な間隔反復（SM-2等）
- ソーシャル機能（デッキ共有・公開）
- モバイルアプリ (iOS / Android)

---

## Roadmap

### v0.2.0 候補（学習体験の向上）

- **URLプレビュー**: 取得したテキスト内容を生成前に確認できる
- **カード枚数の選択**: 5・10・15・20枚から選択
- **フラッシュカードのシャッフル**: カード順序をランダム化
- **間隔反復の初歩的サポート**: 「もう一度」と判定したカードをセッション内で再出題
- **モバイルスワイプ操作**: 左右スワイプで正解・不正解を記録

### v0.3.0 候補（コンテンツ拡張）

- **PDFアップロード**: PDF から本文を抽出してカード生成
- **デッキ複製**: 既存デッキをベースに新しいデッキを作成
- **カードの並び替え**: ドラッグ＆ドロップで順序変更

### v0.4.0 候補（共有・エクスポート）

- **デッキ公開**: URLで他のユーザーとデッキを共有
- **Ankiエクスポート**: `.apkg` 形式でエクスポート
- **CSV インポート / エクスポート**

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router), React 19, TypeScript |
| スタイリング | Tailwind CSS v4, shadcn/ui (Radix UI) |
| バックエンド | Next.js Route Handlers |
| データベース | Supabase (PostgreSQL + RLS) |
| AI | Anthropic API (claude-sonnet-4-6) |
| 認証 | Supabase Auth + @supabase/ssr |
| バリデーション | Zod |

---

## セットアップ

### 必要なもの

- Node.js 20+
- Supabase プロジェクト（無料プランで可）
- Anthropic API キー

### 手順

1. リポジトリをクローン

```bash
git clone <repository-url>
cd StudyForge-AI
npm install
```

2. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して以下を設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

3. データベースのマイグレーション

Supabase ダッシュボードの SQL エディタで `supabase/migrations/001_initial_schema.sql` を実行します。

4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

---

## ディレクトリ構成

```
app/
  api/          # Route Handlers（AIはここで呼び出す）
  auth/         # ログイン・サインアップ
  decks/        # デッキ一覧・詳細・学習・クイズ
  generate/     # カード生成・確認
components/
  auth/         # 認証フォーム
  decks/        # デッキ管理UI
  generate/     # カード生成UI
  layout/       # ヘッダー
  study/        # 学習・クイズUI
  ui/           # 汎用UIコンポーネント（shadcn互換）
lib/
  ai/           # AI生成ロジック（プロバイダー抽象化）
  supabase/     # Supabaseクライアント
  validators.ts # Zodスキーマ
types/          # TypeScript型定義
supabase/
  migrations/   # DDL・RLSポリシー
```

---

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run lint      # ESLint
npx tsc --noEmit  # 型チェック
```
