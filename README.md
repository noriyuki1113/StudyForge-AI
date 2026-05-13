# StudyForge AI

IT学習向けフラッシュカード自動生成アプリ。テキストまたはURLを入力するとAIがカードを生成し、フラッシュカード学習・小テストで復習できます。

## 機能

- テキスト入力 / URL入力からフラッシュカードを AI 生成（Claude claude-sonnet-4-6）
- 生成結果のプレビュー・編集・削除
- デッキ保存・カード一覧管理
- フラッシュカード学習（タップで反転、正解/不正解記録）
- 小テスト（4択、AI生成問題）
- 学習履歴の集計表示
- メール/パスワード認証（Supabase Auth）

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

## セットアップ

### 必要なもの

- Node.js 20+
- Supabase プロジェクト
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

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run lint      # ESLint
npx tsc --noEmit  # 型チェック
```
