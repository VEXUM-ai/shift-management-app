# シフト管理・勤怠管理・給与計算アプリ

シフト提出、勤怠管理、給与計算を一元管理できるWebアプリケーションです。

## 🎯 主な機能

### 1. メンバー管理
- メンバーの登録・削除
- 名前とメールアドレスの管理

### 2. 常駐先管理
- **常駐先・オフィスの登録**
- **会社ロゴの画像アップロード対応** 📷
- 常駐先ごとに異なる時給を設定
- 常駐先ごとの交通費設定（オフィス/常駐先で分離）
- カード形式で視覚的に表示

### 3. シフト管理
- **一括シフト登録機能**
- **月ごとのシフト履歴表示** 📅
- メンバーと勤務地を選択形式で入力
- 交通費の自動入力（常駐先設定から）
- 常駐先ロゴを含むシフト一覧表示
- **CSV出力機能**
- **Slack通知機能** 🔔

### 4. 勤怠管理
- 出勤・退勤の打刻
- 出勤先（オフィス/常駐先）の選択
- 勤務時間の自動計算
- 勤怠履歴の表示

### 5. 給与計算
- **出勤先別の給与計算**
- メンバー・月を選択して計算
- 出勤先ごとの勤務時間と給与を表示
- 合計時間と合計給与を自動計算
- 交通費込みの給与計算

## 🚀 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- jsPDF (PDF出力用)
- CSS3

### バックエンド
- Vercel Serverless Functions
- Node.js
- TypeScript

### デプロイ
- Vercel
- GitHub連携

## 📦 セットアップ

### ローカル開発環境

```bash
# プロジェクトのクローン
git clone <repository-url>
cd shift-management-app

# フロントエンドの起動
cd frontend
npm install
npm run dev

# 別のターミナルでバックエンド起動（オプション）
cd backend
npm install
npm run dev
```

### Vercel環境変数設定

Slack通知を有効にする場合、Vercelで以下の環境変数を設定してください：

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## 📚 ドキュメント

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Vercelへのデプロイ手順
- **[OPTIMIZATION.md](OPTIMIZATION.md)** - 実施した最適化の詳細
- **[CHANGELOG.md](CHANGELOG.md)** - 変更履歴

## 🗂️ プロジェクト構造

```
shift-management-app/
├── api/                    # Vercel Serverless Functions
│   ├── _storage.ts        # データストレージ管理
│   ├── members.ts         # メンバーAPI
│   ├── locations.ts       # 常駐先API
│   ├── shifts.ts          # シフトAPI
│   ├── attendance.ts      # 勤怠API
│   ├── salary.ts          # 給与API
│   └── slack.ts           # Slack通知API
├── frontend/
│   ├── src/
│   │   ├── components/    # UIコンポーネント
│   │   ├── hooks/         # カスタムReact Hooks
│   │   ├── utils/         # ユーティリティ関数
│   │   ├── types/         # TypeScript型定義
│   │   ├── styles/        # スタイルシート
│   │   └── App.tsx        # メインアプリ
│   └── package.json
├── vercel.json            # Vercel設定
└── README.md
```

## 📝 主要な改善点

### ✨ 最新の追加機能
- **ロゴ画像アップロード**: 常駐先ごとに会社ロゴを設定可能（5MB制限）
- **月別シフト表示**: 月ごとにシフトを整理して表示
- **交通費管理**: オフィス/常駐先で交通費を分けて管理
- **CSV出力**: 月別のシフトデータをCSV形式でエクスポート
- **Slack通知**: シフト登録時に自動通知

### 🔧 最適化と品質向上
- **型安全性の強化**: TypeScriptの厳密な型定義を全体に適用
- **エラーハンドリング**:
  - APIレスポンスの詳細なバリデーション
  - ユーザーフレンドリーなエラーメッセージ表示
  - フロントエンドでのエラー状態管理
- **パフォーマンス最適化**:
  - `useCallback`、`useMemo`による再レンダリング防止
  - 並列API呼び出しによる一括登録の高速化
  - データフィルタリングのメモ化
- **バリデーション強化**:
  - 入力データの形式チェック（日付、時間、メール等）
  - 重複データの防止
  - 論理的整合性の検証（終了時間 > 開始時間等）
- **セキュリティ対策**:
  - XSS対策のための入力サニタイゼーション
  - ファイルサイズ制限による過負荷防止
  - HTTPステータスコードの適切な使用
- **UIの改善**:
  - ローディング状態の可視化
  - エラーメッセージの明確な表示
  - 無効状態の適切な管理

## 📄 ライセンス

MIT

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
