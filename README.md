# Shift Management App

常駐人材の勤怠管理・シフト管理・給与計算を行うWebアプリケーション。
React + TypeScript + Viteで構築されたモダンなSPA。

## 主な機能

### 🏢 常駐勤務管理（NEW!）
- **固定5時間勤務**: 開始時刻を入力すると自動で終了時刻を計算（開始時刻 + 5時間）
- **常駐先クライアント管理**: 各常駐先のクライアント名を記録
- **個別ミーティング申請**: 複数のミーティングを追加可能
  - クライアント先名
  - 開始・終了時刻
  - 目的・内容
- **日別・週間表示**: スマホ最適化されたカード表示とPC向けテーブル表示
- **リアルタイム編集**: モーダルで直感的に編集・保存

### 👥 メンバー管理
- プロフィール詳細、アクセス権限、認証情報の管理
- 時給・固定給の設定
- 管理者・アドバイザー権限

### 📍 勤務地管理
- 時給設定、交通費、ロゴアップロード

### 📅 シフト管理
- 一括アップロード、月次履歴、CSV出力
- Slack通知（オプション）

### ⏰ 勤怠管理
- 出退勤打刻、自動時間計算、履歴表示

### 💰 給与計算
- メンバー・勤務地別の給与集計
- 交通費を含む詳細計算

## Tech Stack

- Frontend: React 18, TypeScript, Vite, jsPDF, CSS Modules.
- Backend: Node.js, TypeScript, Vercel serverless functions.
- Tooling: npm workspaces, concurrently, Vercel CLI.

## Repository Layout

```text
shift-management-app/
├── api/               # Serverless endpoints deployed via Vercel
├── backend/           # Node.js backend (shared logic and local dev server)
├── docs/              # Project documentation
├── frontend/          # React single-page application
├── package.json       # npm workspaces + shared scripts
└── vercel.json        # Deployment configuration
```

## 🚀 クイックスタート

### フロントエンドのみ起動（推奨）

```bash
# フロントエンドディレクトリに移動
cd frontend

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開く

### 使い方

1. **ログイン**
   - 初回起動時は管理者アカウントでログイン
   - デフォルト: admin@example.com / password

2. **メンバー登録**
   - 「メンバー管理」タブで新しいメンバーを追加

3. **オフィス出勤表で常駐勤務を登録**
   - 「オフィス出勤表」タブを開く
   - メンバーカードの「編集」ボタンをクリック
   - **常駐勤務**: 常駐先クライアント名と開始時刻を入力（終了時刻は自動計算）
   - **個別ミーティング**: 「+ ミーティング追加」でクライアント先MTGを追加
   - 「保存」で完了

4. **表示切替**
   - 日別表示: スマホ向けのカードレイアウト
   - 週間表示: PC向けのテーブル表示

### その他のコマンド

```bash
# ビルド
npm run build

# 型チェック
npm run type-check

# キャッシュクリア
npm run clean
```

## Environment Variables

- Frontend: copy `frontend/.env.example` to `frontend/.env` and adjust
  `VITE_API_URL`/`VITE_ENABLE_BACKEND`.
- Backend: copy `backend/.env.example` to `backend/.env` and set the JWT secret,
  rate-limiting, and HTTPS configuration. Default ports assume the frontend runs
  on `5173`.

## Documentation

- `docs/getting-started.md` – cloning, local setup, troubleshooting tips.
- `docs/deployment.md` – Vercel configuration, environment variables, and
  release flow.
- `docs/authentication.md` – session model, password handling, and role-based
  access.
- `docs/backend.md` – serverless architecture, routes, and data contracts.
- `docs/optimizations.md` – performance, validation, and reliability work.
- `docs/ui-ux.md` – UX enhancements and design rationale.
- `CHANGELOG.md` – tracked release history.

## License

MIT
