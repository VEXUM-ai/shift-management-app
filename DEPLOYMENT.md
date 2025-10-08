# Vercelデプロイメントガイド

このガイドでは、シフト管理アプリをGitHubとVercelを使ってデプロイする手順を説明します。

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubアカウントでサインアップ可能）
- Gitがローカルにインストールされていること

## 🚀 ステップ1: GitHubリポジトリの作成とプッシュ

### 1-1. Gitリポジトリの初期化

プロジェクトディレクトリで以下のコマンドを実行：

```bash
cd H:\マイドライブ\shift-management-app

# Gitリポジトリを初期化（まだの場合）
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Shift management app with improvements"
```

### 1-2. GitHubリポジトリの作成

1. [GitHub](https://github.com)にアクセス
2. 右上の「+」ボタンから「New repository」を選択
3. リポジトリ名を入力（例: `shift-management-app`）
4. 公開/非公開を選択
5. **「Initialize this repository with a README」のチェックは外す**
6. 「Create repository」をクリック

### 1-3. リモートリポジトリの設定とプッシュ

GitHubで作成したリポジトリのURLを使用：

```bash
# リモートリポジトリを追加（YOUR_USERNAMEを実際のユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/shift-management-app.git

# メインブランチの名前を設定
git branch -M main

# プッシュ
git push -u origin main
```

## 🌐 ステップ2: Vercelプロジェクトのセットアップ

### 2-1. Vercelにログイン

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」または「Log In」をクリック
3. GitHubアカウントで認証

### 2-2. 新しいプロジェクトの作成

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリから`shift-management-app`を選択
3. 「Import」をクリック

### 2-3. プロジェクト設定

**Build & Development Settings:**

- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

**Environment Variables:**

以下の環境変数を設定：

| Name | Value | 説明 |
|------|-------|------|
| `NODE_ENV` | `production` | 本番環境フラグ |
| `VITE_API_URL` | `/api` | APIのベースURL |
| `JWT_SECRET` | `your-secret-key-here` | JWT認証用シークレット（強力なランダム文字列） |

**JWT_SECRETの生成方法:**
```bash
# Node.jsで生成
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2-4. デプロイ

「Deploy」ボタンをクリックして初回デプロイを開始

## ⚙️ ステップ3: vercel.json の最適化

プロジェクトルートの`vercel.json`を以下のように更新（既に設定済み）:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 📁 ステップ4: ビルドスクリプトの確認

### package.json (ルート)

```json
{
  "scripts": {
    "build": "npm run build --workspace=frontend",
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend"
  }
}
```

### frontend/package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## 🗄️ ステップ5: データベースの設定

### オプション1: Vercel Postgres（推奨）

1. Vercelプロジェクトの「Storage」タブに移動
2. 「Create Database」→「Postgres」を選択
3. データベース名を入力して作成
4. 接続情報が自動的に環境変数に追加されます

**必要な環境変数:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### オプション2: SQLite（開発用）

SQLiteを使用する場合は、Vercelのファイルシステムは読み取り専用のため、
永続化には外部ストレージ（S3など）が必要です。

**推奨**: 本番環境ではPostgreSQLを使用

## 🔐 ステップ6: 環境変数の設定

Vercelプロジェクト設定で以下の環境変数を追加：

### 必須環境変数

```
NODE_ENV=production
VITE_API_URL=/api
JWT_SECRET=<強力なランダム文字列>
```

### オプション環境変数

```
# Slack通知（オプション）
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# CORS設定
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

## 🔄 ステップ7: 自動デプロイの設定

GitHubとVercelが連携されると：

1. `main`ブランチへのプッシュ → **本番デプロイ**
2. プルリクエスト → **プレビューデプロイ**

### デプロイ確認

```bash
# 変更をコミット
git add .
git commit -m "Update configuration for production"

# プッシュ（自動デプロイが開始される）
git push origin main
```

## 📊 ステップ8: デプロイ後の確認

### 8-1. デプロイログの確認

1. Vercelダッシュボードの「Deployments」タブ
2. 最新のデプロイメントをクリック
3. ビルドログを確認

### 8-2. 動作確認

デプロイ完了後、以下を確認：

- ✅ フロントエンドが正しく表示される
- ✅ API エンドポイントが動作する
- ✅ データベース接続が成功する
- ✅ 認証機能が動作する

### 8-3. デバッグ

エラーが発生した場合：

1. Vercelの「Logs」タブでエラーを確認
2. 環境変数が正しく設定されているか確認
3. ビルドログでエラーメッセージを確認

## 🛠️ トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
npm run build

# エラーがある場合は修正してコミット
git add .
git commit -m "Fix build errors"
git push origin main
```

### APIが動作しない

1. `vercel.json`のルーティング設定を確認
2. 環境変数が設定されているか確認
3. APIディレクトリの構造を確認

### データベース接続エラー

1. 環境変数`POSTGRES_URL`などが設定されているか確認
2. データベースの初期化スクリプトを実行
3. Vercel Logsでエラーメッセージを確認

## 📝 デプロイ後のメンテナンス

### 環境変数の更新

```bash
# Vercel CLIを使用（オプション）
npm i -g vercel
vercel env add VARIABLE_NAME
```

### カスタムドメインの設定

1. Vercelプロジェクト設定の「Domains」タブ
2. カスタムドメインを追加
3. DNSレコードを更新

## 🎉 完了！

デプロイが成功したら、以下のURLでアクセスできます：

- **本番URL**: `https://your-project.vercel.app`
- **カスタムドメイン**: `https://your-domain.com`（設定した場合）

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions](https://github.com/features/actions)

---

**注意事項:**
- 本番環境では必ず強力なJWT_SECRETを使用してください
- データベースのバックアップを定期的に取得してください
- セキュリティアップデートを定期的に適用してください
