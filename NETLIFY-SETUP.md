# Netlifyデプロイガイド

このドキュメントでは、Shift Management AppをNetlifyにデプロイする方法を説明します。

## 概要

- **フロントエンド**: Netlify Hostingで配信
- **バックエンド**: Netlify Functionsでサーバーレス実行
- **ストレージ**: 現在はメモリ内（本番環境では外部DBが必要）

## 前提条件

- Netlifyアカウント（[netlify.com](https://www.netlify.com/)で無料登録）
- GitHubアカウント（推奨）
- Node.js 18以上

## デプロイ手順

### 方法1: GitHub連携（推奨）

#### 1. GitHubリポジトリにプッシュ

```bash
# まだGitリポジトリでない場合
git init
git add .
git commit -m "Initial commit for Netlify deployment"

# GitHubに新しいリポジトリを作成してからプッシュ
git remote add origin https://github.com/YOUR_USERNAME/shift-management-app.git
git branch -M main
git push -u origin main
```

#### 2. Netlifyでサイトを作成

1. [Netlify](https://app.netlify.com/)にログイン
2. **"Add new site"** → **"Import an existing project"** をクリック
3. **"Deploy with GitHub"** を選択
4. リポジトリを選択（shift-management-app）
5. ビルド設定を確認（netlify.tomlがあるので自動設定されます）:
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Functions directory**: `netlify/functions`
6. **"Deploy site"** をクリック

### 方法2: Netlify CLI

#### 1. Netlify CLIをインストール

```bash
npm install -g netlify-cli
```

#### 2. ログイン

```bash
netlify login
```

#### 3. サイトを初期化

```bash
netlify init
```

プロンプトに従って設定:
- **Create & configure a new site**: Yes
- **Team**: 自分のチームを選択
- **Site name**: 任意の名前（例: shift-management-app）
- **Build command**: `npm run build`
- **Directory to deploy**: `frontend/dist`

#### 4. デプロイ

```bash
# テストデプロイ（ドラフト）
netlify deploy

# 本番デプロイ
netlify deploy --prod
```

## API移行（重要）

Vercel ServerlessからNetlify Functionsへ移行するには、APIファイルの変更が必要です。

### ディレクトリ構造の変更

Vercelの `api/` フォルダの内容を `netlify/functions/` に移動し、各ファイルを修正します。

```
api/
  ├── members.ts       →  netlify/functions/members.ts
  ├── locations.ts     →  netlify/functions/locations.ts
  ├── shifts.ts        →  netlify/functions/shifts.ts
  ├── attendance.ts    →  netlify/functions/attendance.ts
  ├── salary.ts        →  netlify/functions/salary.ts
  ├── slack.ts         →  netlify/functions/slack.ts
  └── _storage.ts      →  netlify/functions/_storage.ts
```

### コード変更例

#### Vercel版（api/test.ts）

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'GET') {
    return res.json({ status: 'ok' })
  }
}
```

#### Netlify版（netlify/functions/test.ts）

```typescript
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORSヘッダーは netlify.toml で設定可能

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ status: 'ok' }),
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  }
}
```

### 主な変更点

1. **インポート**: `@vercel/node` → `@netlify/functions`
2. **型定義**: `VercelRequest, VercelResponse` → `Handler, HandlerEvent, HandlerContext`
3. **エクスポート**: `export default function` → `export const handler: Handler`
4. **レスポンス形式**: `res.json()` → オブジェクトを返す `{ statusCode, headers, body }`
5. **リクエストメソッド**: `req.method` → `event.httpMethod`
6. **リクエストボディ**: `req.body` → `JSON.parse(event.body || '{}')`
7. **クエリパラメータ**: `req.query` → `event.queryStringParameters`

### 必要なパッケージ

```bash
npm install @netlify/functions
```

`package.json` に追加:

```json
{
  "devDependencies": {
    "@netlify/functions": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 環境変数の設定

Netlify管理画面で環境変数を設定:

1. **Site settings** → **Environment variables**
2. 以下の変数を追加:
   - `NODE_ENV`: `production`
   - その他、バックエンドで必要な環境変数（JWT_SECRET など）

## ストレージに関する注意

現在のコードは `_storage.ts` でメモリ内にデータを保存していますが、Netlify Functionsはステートレスなので**再起動するとデータが消えます**。

本番環境では以下のいずれかを使用してください:

- **Netlify Blob**: Netlifyの組み込みストレージ
- **外部データベース**: Supabase, MongoDB Atlas, PostgreSQL (Neon), Firebase など
- **Netlify KV**: キーバリューストア

## テスト

デプロイ後、以下のエンドポイントをテスト:

```bash
# 例: https://your-site-name.netlify.app/api/test
curl https://your-site-name.netlify.app/api/test
```

## トラブルシューティング

### ビルドエラー

- **ログを確認**: Netlify管理画面の **Deploys** → **Deploy log**
- **Node.jsバージョン**: netlify.toml で正しいバージョンを指定

### APIが動かない

- **関数ログを確認**: Netlify管理画面の **Functions** タブ
- **パスの確認**: `/api/*` が `/.netlify/functions/*` にリダイレクトされているか

### CORS エラー

- `netlify.toml` の `[[headers]]` セクションを確認
- 各関数でもCORSヘッダーを返しているか確認

## 参考リンク

- [Netlify Functions ドキュメント](https://docs.netlify.com/functions/overview/)
- [Netlify TOML リファレンス](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [Vercel → Netlify 移行ガイド](https://docs.netlify.com/integrations/frameworks/)

## まとめ

1. ✅ `netlify.toml` を作成（完了）
2. 🔄 `api/` を `netlify/functions/` に移行（コード変更が必要）
3. 📦 `@netlify/functions` パッケージをインストール
4. 🚀 NetlifyでGitHubリポジトリを連携してデプロイ
5. 🗄️ 本番環境用のデータベースを検討

何か質問があればお気軽にどうぞ！
