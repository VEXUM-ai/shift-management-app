# クイックスタートガイド 🚀

## GitHubへのプッシュとVercelデプロイ（5分で完了）

### ステップ1: Gitセットアップ（1分）

**方法A: 自動スクリプト**
```bash
# Windowsの場合
setup-git.bat
```

**方法B: 手動コマンド**
```bash
cd "H:\マイドライブ\shift-management-app"

# Gitリポジトリ初期化
git init

# すべてのファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: Shift management app"
```

### ステップ2: GitHubリポジトリ作成（1分）

1. https://github.com/new にアクセス
2. リポジトリ名: `shift-management-app`
3. Public または Private を選択
4. **「Initialize this repository with a README」のチェックは外す**
5. 「Create repository」をクリック

### ステップ3: GitHubにプッシュ（1分）

```bash
# リモートリポジトリを追加（YOUR_USERNAMEを置き換え）
git remote add origin https://github.com/YOUR_USERNAME/shift-management-app.git

# メインブランチを設定
git branch -M main

# プッシュ
git push -u origin main
```

### ステップ4: Vercelデプロイ（2分）

1. https://vercel.com にアクセス
2. 「Sign Up」でGitHubアカウントで認証
3. 「Add New...」→「Project」
4. GitHubから `shift-management-app` を選択
5. 「Import」をクリック

**設定:**
- Framework Preset: **Vite**
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `frontend/dist`

**環境変数を追加:**

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `VITE_API_URL` | `/api` |
| `JWT_SECRET` | [強力なランダム文字列] |

**JWT_SECRET生成:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

6. 「Deploy」をクリック

### ステップ5: 完了！ 🎉

デプロイ完了後、以下でアクセス可能:
- `https://your-project.vercel.app`

---

## トラブルシューティング

### ビルドエラーが発生した場合

```bash
# ローカルでビルドテスト
npm run build

# エラーを修正後
git add .
git commit -m "Fix build errors"
git push origin main
```

### APIが動作しない場合

1. Vercelの環境変数を確認
2. `vercel-optimized.json`を`vercel.json`にコピー
3. 再デプロイ

---

## 詳細ガイド

完全なデプロイメントガイドは [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

---

## 今後の更新

```bash
# 変更をコミット
git add .
git commit -m "Update features"

# プッシュ（自動デプロイ開始）
git push origin main
```

自動的にVercelがデプロイを開始します！
