# Backend API - Shift Management App

セキュアな認証システムを備えたシフト管理アプリのバックエンドAPI

## 🔐 セキュリティ機能

- **JWT認証**: JSON Web Tokenによるステートレス認証
- **bcrypt**: パスワードハッシュ化（12 rounds）
- **Rate Limiting**: ブルートフォース攻撃対策
- **Helmet**: セキュリティヘッダー設定
- **CORS**: クロスオリジンリクエスト制御
- **HTTPS対応**: SSL/TLS暗号化通信（本番環境用）

## 📦 セットアップ

### 1. 依存関係のインストール

```bash
cd backend
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成：

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
BCRYPT_ROUNDS=12
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

サーバーは http://localhost:3001 で起動します

## 🚀 API エンドポイント

### 認証

#### POST /api/auth/login
ユーザーログイン

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "is_admin": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/register
新規ユーザー登録

**リクエスト:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "secure123",
  "is_admin": false
}
```

#### GET /api/auth/me
現在のユーザー情報取得（要認証）

**ヘッダー:**
```
Authorization: Bearer <token>
```

#### POST /api/auth/change-password
パスワード変更（要認証）

**リクエスト:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

### ヘルスチェック

#### GET /health
サーバー稼働状況確認

## 🔒 HTTPS設定（本番環境）

### SSL証明書の準備

1. SSL証明書を取得（Let's Encryptなど）
2. `.env`ファイルに設定：

```env
ENABLE_HTTPS=true
SSL_KEY_PATH=/path/to/privkey.pem
SSL_CERT_PATH=/path/to/fullchain.pem
```

### 自己署名証明書の作成（開発用）

```bash
# backend/ssl ディレクトリ作成
mkdir ssl
cd ssl

# 秘密鍵と証明書を生成
openssl req -nodes -new -x509 -keyout key.pem -out cert.pem -days 365
```

## 🛡️ セキュリティベストプラクティス

### 本番環境のチェックリスト

- [ ] 強力なJWT_SECRETを設定（最低32文字、ランダム）
- [ ] HTTPS を有効化
- [ ] CORS_ORIGIN を本番ドメインに限定
- [ ] NODE_ENV=production に設定
- [ ] データベースのバックアップ設定
- [ ] ログ監視の設定
- [ ] レート制限の調整

### JWT_SECRETの生成

```bash
# Node.jsで生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# またはOpenSSLで生成
openssl rand -hex 32
```

## 📊 レート制限

### API全体
- 15分間で100リクエスト

### ログインエンドポイント
- 15分間で5回まで（失敗時のみカウント）

### パスワードリセット
- 1時間で3回まで

## 🗄️ データベース

SQLiteを使用（開発環境）

初回起動時に以下が自動実行されます：
- テーブル作成
- デフォルト管理者アカウント作成
  - Email: `admin@shift-management.com`
  - Password: `admin123`

**⚠️ 初回ログイン後、必ずパスワードを変更してください！**

## 🧪 テスト

### APIテスト（curlコマンド）

```bash
# ログイン
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shift-management.com","password":"admin123"}'

# ユーザー情報取得
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# ヘルスチェック
curl http://localhost:3001/health
```

## 📝 開発

### ビルド

```bash
npm run build
```

ビルドされたファイルは`dist/`ディレクトリに出力されます。

### 本番環境での起動

```bash
npm start
```

## 🐛 トラブルシューティング

### "Cannot find module" エラー

```bash
npm install
npm run build
```

### ポート既に使用中

`.env`ファイルでPORTを変更：

```env
PORT=3002
```

### CORS エラー

フロントエンドのURLが`.env`の`CORS_ORIGIN`と一致しているか確認

## 📚 依存パッケージ

### 主要パッケージ

- **express**: Webフレームワーク
- **jsonwebtoken**: JWT認証
- **bcryptjs**: パスワードハッシュ化
- **helmet**: セキュリティヘッダー
- **express-rate-limit**: レート制限
- **cors**: CORS設定
- **sqlite3**: データベース

### 開発ツール

- **typescript**: 型安全性
- **tsx**: TypeScript実行環境
- **nodemon**: ホットリロード

## 🤝 貢献

バグ報告や機能リクエストはGitHub Issuesへ

## 📄 ライセンス

MIT

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
