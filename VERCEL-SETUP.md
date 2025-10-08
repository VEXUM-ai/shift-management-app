# Vercel設定ガイド（簡易版）

## 🎯 Vercelで設定する内容

### オプション1: 自動検出（推奨）

Vercelが自動的に検出するため、**何も入力せずにそのまま進む**

### オプション2: 手動設定

もし手動で設定する場合：

#### Framework Preset
- 選択: **Vite** または **Other**

#### Root Directory
- そのまま: `./` （空欄でOK）

#### Build and Output Settings

**Build Command:**
```
npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```
npm install
```

---

## ⚙️ 環境変数の設定（必須）

Vercelプロジェクト設定 → Environment Variables

### 必須の環境変数

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Production, Preview, Development |
| `VITE_API_URL` | `/api` | Production, Preview, Development |
| `JWT_SECRET` | `[生成した64文字の文字列]` | Production, Preview, Development |

### JWT_SECRETの生成方法

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Node.js (コマンドプロンプト):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**オンラインツール:**
https://www.uuidgenerator.net/

---

## 📋 設定手順（詳細）

### ステップ1: プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」
2. GitHubから `VEXUM-ai/shift-management-app` を選択
3. 「Import」をクリック

### ステップ2: プロジェクト設定

**Configure Project 画面で:**

#### General Settings
- **Project Name**: `shift-management-app` (または任意の名前)
- **Framework Preset**: `Vite` を選択

#### Build and Output Settings

**このセクションは展開して設定:**

- ✅ **Override** をチェック

- **Build Command**:
  ```
  npm run build
  ```

- **Output Directory**:
  ```
  frontend/dist
  ```

- **Install Command**:
  ```
  npm install
  ```

#### Root Directory
- そのまま `./` でOK（変更不要）

### ステップ3: 環境変数の追加

「Environment Variables」セクションで「Add」をクリック:

1. **NODE_ENV**
   - Value: `production`
   - Environment: All (Production, Preview, Development)

2. **VITE_API_URL**
   - Value: `/api`
   - Environment: All

3. **JWT_SECRET**
   - Value: [生成した64文字の文字列]
   - Environment: All

### ステップ4: デプロイ

「Deploy」ボタンをクリック

---

## 🔍 トラブルシューティング

### 「Build Command」や「Output Directory」が入力できない

**解決方法:**

1. 「Build and Output Settings」セクションの **Override** をチェック
2. すると入力フィールドが有効になります

### ビルドエラーが発生する

**確認事項:**

1. ローカルでビルドが成功するか確認:
   ```bash
   npm run build
   ```

2. エラーがある場合は修正してGitHubにプッシュ:
   ```bash
   git add .
   git commit -m "Fix build errors"
   git push origin main
   ```

3. Vercelで「Redeploy」をクリック

### APIが動作しない

1. 環境変数が正しく設定されているか確認
2. Vercelの「Logs」タブでエラーを確認
3. `vercel.json`の設定を確認

---

## 📸 設定画面のスクリーンショット（参考）

### Build and Output Settings

```
┌─────────────────────────────────────────┐
│ Build and Output Settings               │
│                                         │
│ ☑ Override                              │
│                                         │
│ Build Command                           │
│ ┌─────────────────────────────────────┐ │
│ │ npm run build                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Output Directory                        │
│ ┌─────────────────────────────────────┐ │
│ │ frontend/dist                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Install Command                         │
│ ┌─────────────────────────────────────┐ │
│ │ npm install                         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ✅ デプロイ完了後の確認

1. Vercelが提供するURLにアクセス
2. フロントエンドが表示されることを確認
3. APIエンドポイントが動作することを確認

デプロイURL例: `https://shift-management-app-xxx.vercel.app`

---

## 🎉 完了！

これで本番環境にデプロイされました！

今後の更新は、GitHubにプッシュするだけで自動デプロイされます:

```bash
git add .
git commit -m "Update features"
git push origin main
```
