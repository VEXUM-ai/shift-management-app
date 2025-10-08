# バックエンドAPI実装ガイド

## 📋 概要

シフト管理アプリケーションに完全なバックエンドAPIを実装しました。JWT認証、bcryptパスワードハッシュ化、レート制限、HTTPS対応を含む本格的なセキュアシステムです。

---

## 🎯 実装された機能

### 1. JWT認証システム
- **アクセストークン**: 24時間有効
- **リフレッシュトークン**: 7日間有効
- **ステートレス認証**: サーバー側でセッション管理不要
- **自動トークン検証**: すべての保護ルートで自動検証

### 2. bcryptパスワードハッシュ化
- **ソルトラウンド**: 12（推奨値）
- **レインボーテーブル攻撃対策**: ソルト付きハッシュ
- **セキュアな比較**: タイミング攻撃対策

### 3. レート制限
- **API全体**: 15分で100リクエスト
- **ログインエンドポイント**: 15分で5回（失敗時のみ）
- **パスワードリセット**: 1時間で3回
- **ブルートフォース攻撃対策**: 自動ブロック

### 4. HTTPS対応
- **開発環境**: HTTP（localhost）
- **本番環境**: HTTPS必須
- **証明書**: Let's Encrypt対応
- **自己署名証明書**: 開発用サポート

### 5. セキュリティミドルウェア
- **Helmet**: セキュリティヘッダー設定
- **CORS**: クロスオリジンリクエスト制御
- **Compression**: gzip圧縮
- **Morgan**: アクセスログ

---

## 📁 プロジェクト構造

```
backend/
├── src/
│   ├── database/
│   │   └── index.ts              # SQLiteデータベース管理
│   ├── middleware/
│   │   ├── auth.ts               # JWT認証ミドルウェア
│   │   └── rateLimiter.ts        # レート制限設定
│   ├── routes/
│   │   └── auth.ts               # 認証API routes
│   ├── types/
│   │   └── index.ts              # TypeScript型定義
│   ├── utils/
│   │   ├── jwt.ts                # JWTユーティリティ
│   │   └── password.ts           # パスワード関連
│   └── server.ts                 # メインサーバー
├── .env                          # 環境変数（Git無視）
├── .env.example                  # 環境変数テンプレート
├── .gitignore                    # Git無視リスト
├── package.json                  # npm設定
├── tsconfig.json                 # TypeScript設定
└── README.md                     # ドキュメント
```

---

## 🚀 セットアップ手順

### 1. バックエンドのインストール

```bash
cd backend
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成（`.env.example`を参考）：

```env
# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_ROUNDS=12

# HTTPS (production only)
ENABLE_HTTPS=false
```

### 3. バックエンドサーバーの起動

```bash
# 開発モード（ホットリロード）
npm run dev

# 本番モード
npm run build
npm start
```

### 4. フロントエンドの設定

`frontend/.env`を作成：

```env
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_BACKEND=true
```

### 5. フロントエンドの起動

```bash
cd frontend
npm run dev
```

---

## 🔐 API エンドポイント詳細

### POST /api/auth/login

**説明**: ユーザーログイン

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス（成功）**:
```json
{
  "user": {
    "id": 1,
    "name": "山田太郎",
    "email": "user@example.com",
    "is_admin": false,
    "office_transport_fee": 500,
    "salary_type": "hourly",
    "hourly_wage": 1500,
    "fixed_salary": 0,
    "created_at": "2025-01-01T00:00:00.000Z",
    "last_login": "2025-01-10T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**レスポンス（エラー）**:
```json
{
  "error": "Invalid email or password"
}
```

**HTTPステータスコード**:
- `200`: 成功
- `400`: バリデーションエラー
- `401`: 認証失敗
- `429`: レート制限超過

---

### POST /api/auth/register

**説明**: 新規ユーザー登録

**リクエスト**:
```json
{
  "name": "新規ユーザー",
  "email": "newuser@example.com",
  "password": "secure123",
  "is_admin": false
}
```

**レスポンス**:
```json
{
  "user": {
    "id": 2,
    "name": "新規ユーザー",
    "email": "newuser@example.com",
    "is_admin": false,
    ...
  }
}
```

**HTTPステータスコード**:
- `201`: 作成成功
- `400`: バリデーションエラー
- `409`: メールアドレス重複

---

### GET /api/auth/me

**説明**: 現在のユーザー情報取得

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "user": {
    "id": 1,
    "name": "山田太郎",
    "email": "user@example.com",
    ...
  }
}
```

**HTTPステータスコード**:
- `200`: 成功
- `401`: 認証失敗

---

### POST /api/auth/change-password

**説明**: パスワード変更

**リクエストヘッダー**:
```
Authorization: Bearer <token>
```

**リクエスト**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**レスポンス**:
```json
{
  "message": "Password changed successfully"
}
```

**HTTPステータスコード**:
- `200`: 成功
- `400`: バリデーションエラー
- `401`: 現在のパスワードが不正

---

### GET /health

**説明**: ヘルスチェック（認証不要）

**レスポンス**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T10:00:00.000Z",
  "uptime": 123.456
}
```

---

## 🔒 セキュリティ仕様

### JWTトークン

**構造**:
```json
{
  "userId": 1,
  "email": "user@example.com",
  "is_admin": false,
  "iat": 1704879600,
  "exp": 1704966000
}
```

**検証プロセス**:
1. `Authorization`ヘッダーからトークンを抽出
2. JWT署名を検証
3. 有効期限をチェック
4. ユーザー存在確認
5. リクエストにユーザー情報を付与

### パスワードハッシュ化

**bcrypt アルゴリズム**:
```
$2a$12$abcdefghijklmnopqrstuv.WXYZ0123456789
```

- `$2a$`: bcryptバージョン
- `12`: コストファクター（2^12回のハッシュ）
- `abcdef...`: ソルト（ランダム生成）
- `WXYZ...`: ハッシュ値

### レート制限の仕組み

**IPアドレスベース**:
- クライアントのIPアドレスで追跡
- メモリ内カウンター（再起動でリセット）
- スライディングウィンドウ方式

**ヘッダー**:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1704879900
```

---

## 🛡️ 本番環境へのデプロイ

### 1. 環境変数の設定

```env
NODE_ENV=production
PORT=443
ENABLE_HTTPS=true
JWT_SECRET=<強力なランダム文字列>
CORS_ORIGIN=https://yourdomain.com
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

### 2. SSL証明書の取得（Let's Encrypt）

```bash
# Certbotのインストール
sudo apt-get update
sudo apt-get install certbot

# 証明書の取得
sudo certbot certonly --standalone -d yourdomain.com

# 証明書は以下に保存される
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

### 3. 自動更新の設定

```bash
# Crontabに追加
sudo crontab -e

# 毎月1日の午前2時に更新
0 2 1 * * certbot renew --quiet && systemctl restart shift-backend
```

### 4. PM2でのプロセス管理

```bash
# PM2のインストール
npm install -g pm2

# アプリの起動
cd backend
pm2 start dist/server.js --name shift-backend

# 自動再起動の設定
pm2 startup
pm2 save

# ログの確認
pm2 logs shift-backend
```

### 5. Nginxリバースプロキシ（推奨）

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/shift-app/frontend/dist;
        try_files $uri /index.html;
    }
}

# HTTPからHTTPSへリダイレクト
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🧪 テストとデバッグ

### curlでのテスト

```bash
# ログインテスト
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shift-management.com","password":"admin123"}'

# レスポンスからトークンを取得
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 認証が必要なエンドポイント
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# パスワード変更
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"newpass456"}'
```

### Postmanコレクション

**Import用JSON**:
```json
{
  "info": {
    "name": "Shift Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@shift-management.com\",\n  \"password\": \"admin123\"\n}"
        }
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/auth/me",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## 📊 データベーススキーマ

### users テーブル

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- bcryptハッシュ
  is_admin INTEGER DEFAULT 0,
  office_transport_fee REAL DEFAULT 0,
  salary_type TEXT CHECK(salary_type IN ('hourly', 'fixed')),
  hourly_wage REAL DEFAULT 0,
  fixed_salary REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);
```

### デフォルトデータ

初回起動時に自動作成：

```sql
INSERT INTO users (name, email, password, is_admin)
VALUES (
  'System Admin',
  'admin@shift-management.com',
  '<bcryptハッシュ>',
  1
);
```

**ログイン情報**:
- Email: `admin@shift-management.com`
- Password: `admin123`

⚠️ **重要**: 初回ログイン後、必ずパスワードを変更してください！

---

## 🔧 トラブルシューティング

### 問題: "JWT_SECRET is required"

**原因**: `.env`ファイルが見つからないか、JWT_SECRETが未設定

**解決策**:
```bash
# .envファイルを作成
cp .env.example .env

# JWT_SECRETを生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# .envに追加
echo "JWT_SECRET=<生成された値>" >> .env
```

### 問題: "Cannot connect to database"

**原因**: SQLiteファイルの権限エラー

**解決策**:
```bash
# データベースディレクトリの権限確認
ls -la backend/

# 必要に応じて権限を付与
chmod 755 backend/
```

### 問題: "CORS error"

**原因**: フロントエンドのURLがCORS_ORIGINと一致していない

**解決策**:
```env
# backend/.env
CORS_ORIGIN=http://localhost:5173

# または複数オリジンを許可（カンマ区切り）
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 問題: "Rate limit exceeded"

**原因**: 短時間に多数のリクエスト

**解決策**:
```bash
# 15分待つ

# または開発中は制限を緩和
# backend/.env
RATE_LIMIT_MAX_REQUESTS=1000
```

---

## 📚 参考リソース

### 公式ドキュメント

- [Express.js](https://expressjs.com/)
- [JSON Web Tokens](https://jwt.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Helmet](https://helmetjs.github.io/)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)

### セキュリティベストプラクティス

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 🤝 貢献

バグ報告や機能リクエストはGitHub Issuesへ

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
