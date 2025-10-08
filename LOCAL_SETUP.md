# ローカル環境セットアップガイド

## ⚠️ 重要な注意事項

Googleドライブ上では `npm install` が正常に動作しない場合があります。
以下の手順でローカルディスクにコピーして開発することを推奨します。

## 🚀 推奨セットアップ手順

### 1. プロジェクトをローカルディスクにコピー

```bash
# Windowsの場合
xcopy "H:\マイドライブ\shift-management-app" "C:\Projects\shift-management-app" /E /I /H

# またはエクスプローラーで手動コピー
# コピー元: H:\マイドライブ\shift-management-app
# コピー先: C:\Projects\shift-management-app
```

### 2. フロントエンド開発サーバーの起動

```bash
# プロジェクトディレクトリに移動
cd C:\Projects\shift-management-app\frontend

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

開発サーバーが起動したら、ブラウザで以下にアクセス：
```
http://localhost:5173
```

### 3. API（オプション - ローカルでテストする場合）

Vercel環境のAPIを使用する場合は不要ですが、ローカルでAPIをテストする場合：

```bash
# 別のターミナルで
cd C:\Projects\shift-management-app
npm install -g vercel

# Vercel CLIでローカル開発
vercel dev
```

## 📝 Googleドライブ上で直接実行する場合（非推奨）

Googleドライブ上で実行すると以下の問題が発生する可能性があります：
- npm installが非常に遅い、またはエラーになる
- ファイルロックの問題
- パフォーマンスの低下

それでも試す場合：

```bash
cd "H:\マイドライブ\shift-management-app\frontend"

# キャッシュをクリア
npm cache clean --force

# インストール（時間がかかります）
npm install --legacy-peer-deps

# 開発サーバー起動
npm run dev
```

## 🔧 トラブルシューティング

### エラー: `vite: command not found`

```bash
# viteをグローバルにインストール
npm install -g vite

# または、npxで実行
npx vite
```

### エラー: `EACCES` や `EPERM` (権限エラー)

```bash
# Windowsの場合、管理者権限でコマンドプロンプトを開く
# または、別のディレクトリにコピーして実行
```

### ポート 5173 が使用中

```bash
# 別のポートで起動
npm run dev -- --port 3000
```

### インストールが途中で止まる

```bash
# タイムアウトを延長
npm install --legacy-peer-deps --network-timeout 100000
```

## 📱 開発モード

### フロントエンドのみ（推奨）

APIはVercelにデプロイされたものを使用：

1. フロントエンドを起動
2. ブラウザで `http://localhost:5173` にアクセス
3. APIは `/api` エンドポイントを使用（本番環境）

### ローカルAPIを使用（フルスタック開発）

```bash
# ターミナル1: フロントエンド
cd frontend
npm run dev

# ターミナル2: Vercel Dev（API）
cd ..
vercel dev
```

## 🎯 クイックスタート（最短手順）

```bash
# 1. ローカルにコピー
xcopy "H:\マイドライブ\shift-management-app" "C:\Projects\shift-app" /E /I /H

# 2. フロントエンドに移動
cd C:\Projects\shift-app\frontend

# 3. インストール & 起動
npm install && npm run dev
```

ブラウザで `http://localhost:5173` を開く

## 📊 開発時の注意点

### Hot Reload（自動リロード）

Viteは自動的にファイルの変更を検知してリロードします。
保存すれば即座にブラウザに反映されます。

### API Base URL

開発環境では `http://localhost:3000/api` を使用します（Vercel Devの場合）。
本番環境では `/api` を使用します。

設定: `frontend/src/utils/api.ts`

```typescript
export const API_BASE =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:3000/api'
```

### LocalStorage

開発中のデータはブラウザの LocalStorage に保存されます。
リセットする場合：

```javascript
// ブラウザのコンソールで実行
localStorage.clear()
location.reload()
```

## 🎨 推奨開発環境

- **エディタ**: VS Code
- **拡張機能**:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin (Volar)
  - Tailwind CSS IntelliSense（使用する場合）

## 📦 ビルドとプレビュー

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
