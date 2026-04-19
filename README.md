# 鍵貸与管理システム

部署の鍵の貸出・返却を管理する社内向け Web アプリ。

## 技術スタック

- **Next.js** (App Router) / **TypeScript**
- **PostgreSQL** + **Drizzle ORM**
- **Better Auth** (認証)
- **Tailwind CSS** + shadcn/ui

## 開発環境構築

### 前提条件

- Node.js 20+
- Docker

### 手順

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数を設定
cp .env.example .env
# DATABASE_URL と BETTER_AUTH_SECRET を編集

# 3. DB 起動
docker compose up -d

# 4. マイグレーション & シードデータ投入
npm run db:migrate
npm run db:seed

# 5. 開発サーバー起動
npm run dev
```

→ http://localhost:4000

### 環境変数

| 変数                 | 説明                                                 |
| -------------------- | ---------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL 接続文字列                                |
| `BETTER_AUTH_SECRET` | 認証シークレット（`openssl rand -base64 32` で生成） |
| `BETTER_AUTH_URL`    | アプリの URL（開発時は `http://localhost:4000`）     |

## 主なコマンド

```bash
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run lint         # lint チェック
npm run fix          # lint 自動修正
npm run db:generate  # マイグレーションファイル生成
npm run db:migrate   # マイグレーション適用
npm run db:studio    # Drizzle Studio（DB GUI）
```
