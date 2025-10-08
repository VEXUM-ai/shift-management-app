# デプロイメントガイド

## 📦 Vercelへのデプロイ方法

### 1. 前提条件

- GitHubアカウント
- Vercelアカウント（無料プランでOK）
- このプロジェクトをGitHubリポジトリにプッシュ済み

### 2. Vercelプロジェクトのセットアップ

#### 2.1 Vercelにログイン
1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン

#### 2.2 新規プロジェクトの作成
1. ダッシュボードで「Add New Project」をクリック
2. GitHubリポジトリを選択してインポート
3. プロジェクト設定:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (デフォルト)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

#### 2.3 環境変数の設定（オプション）

Slack通知を有効にする場合:

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

設定方法:
1. Vercelプロジェクト > Settings > Environment Variables
2. 変数名と値を入力して「Add」

### 3. デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドとデプロイが自動で開始
3. 完了後、URLが表示される（例: `https://your-app.vercel.app`）

### 4. 自動デプロイの設定

- mainブランチへのpushで自動デプロイ
- プルリクエストごとにプレビューデプロイ

## 🔧 ローカル環境でのテスト

### フロントエンド開発サーバー

```bash
cd frontend
npm install
npm run dev
```

### Vercel CLIでローカルテスト

```bash
# Vercel CLIのインストール
npm install -g vercel

# プロジェクトルートで実行
vercel dev
```

## 📊 本番環境での動作確認

### チェックリスト

- [ ] トップページが表示される
- [ ] メンバー登録・一覧表示が動作する
- [ ] 常駐先登録・ロゴアップロードが動作する
- [ ] シフト一括登録が動作する
- [ ] 月別シフト表示・フィルタが動作する
- [ ] CSV出力が動作する
- [ ] 勤怠打刻が動作する
- [ ] 給与計算が動作する
- [ ] エラー表示が適切に機能する

## 🚨 トラブルシューティング

### ビルドエラーが発生する場合

1. **依存関係のバージョン確認**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Node.jsバージョンの確認**
   - 推奨: Node.js 18.x以上

### APIエンドポイントが動作しない場合

1. **vercel.json の確認**
   - リライトルールが正しく設定されているか

2. **ログの確認**
   - Vercel Dashboard > Deployments > Function Logs

### CORS エラーが発生する場合

- `vercel.json` のheaders設定を確認
- API関数内のCORS設定を確認

## 🔄 データ永続化について

現在はメモリストレージを使用しているため、以下の制限があります:

- サーバーレス関数の再起動でデータが消失
- 複数インスタンス間でのデータ共有不可

### 本番環境での推奨データベース

長期運用には以下のいずれかを推奨:

1. **Vercel KV** (Redis)
   - 簡単な統合
   - キーバリューストア

2. **Supabase** (PostgreSQL)
   - リレーショナルDB
   - リアルタイム機能

3. **PlanetScale** (MySQL)
   - スケーラブル
   - ブランチング機能

## 📈 パフォーマンス最適化

### 実装済みの最適化

- React.memo、useCallback、useMemoによる再レンダリング防止
- 並列API呼び出し（Promise.allSettled）
- データフィルタリングのメモ化
- 画像サイズ制限（5MB）

### 追加推奨事項

- 画像の最適化（WebP形式、圧縮）
- CDNの活用（Vercelは自動で最適化）
- コード分割（React.lazy）

## 🔒 セキュリティ

### 実装済みのセキュリティ対策

- 入力バリデーション（API層・フロントエンド両方）
- XSS対策（入力のサニタイゼーション）
- ファイルサイズ制限
- HTTPステータスコードの適切な使用

### 追加推奨事項

- 認証・認可の実装（Auth0、NextAuth.js等）
- HTTPS強制（Vercelはデフォルトで対応）
- レート制限の実装
- 環境変数の厳密な管理

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
