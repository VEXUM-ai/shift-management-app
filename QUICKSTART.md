# 🚀 クイックスタートガイド

## 最も簡単な起動方法

### 方法1: バッチファイルで起動（Windows推奨）

1. **[start-local.bat](start-local.bat)** をダブルクリック
2. 指示に従ってインストール（初回のみ）
3. ブラウザで `http://localhost:5173` を開く

### 方法2: 手動でコマンド実行

```bash
# 1. フロントエンドディレクトリに移動
cd "H:\マイドライブ\shift-management-app\frontend"

# 2. 依存関係をインストール（初回のみ）
npm install

# 3. 開発サーバーを起動
npm run dev
```

起動したら、ブラウザで以下にアクセス:
```
http://localhost:5173
```

## ⚠️ Googleドライブ上での注意点

Googleドライブ上で`npm install`を実行すると、以下の問題が発生する可能性があります：

- インストールが非常に遅い
- ファイルロックエラー
- タイムアウトエラー

### 推奨: ローカルディスクにコピー

```bash
# プロジェクトをCドライブにコピー
xcopy "H:\マイドライブ\shift-management-app" "C:\Projects\shift-app" /E /I /H

# コピー先で起動
cd C:\Projects\shift-app\frontend
npm install
npm run dev
```

## 📱 使い方

### 初回起動時

1. **ロール選択画面**が表示されます
   - `管理者` - すべての機能にアクセス可能
   - `メンバー` - 個人のシフト管理のみ

2. **管理者として起動する場合**:
   - 「管理者」を選択
   - メンバー登録、常駐先登録、シフト管理などが可能

3. **メンバーとして起動する場合**:
   - 「メンバー」を選択
   - メンバーを選択
   - 自分のシフトのみ閲覧・登録可能

### 主な機能

| タブ | 機能 |
|------|------|
| メンバー管理 | メンバーの追加・削除・編集 |
| 常駐先管理 | 勤務地の登録・ロゴアップロード |
| シフト登録 | シフトの一括登録 |
| シフト一覧 | 月別シフト表示・CSV出力 |
| 勤怠管理 | 出退勤の打刻 |
| 給与計算 | 月別給与の自動計算 |

## 🔧 トラブルシューティング

### ポート 5173 が既に使用中

```bash
# 別のポートで起動
npm run dev -- --port 3000
```

### vite が見つからない

```bash
# 依存関係を再インストール
npm install

# または、グローバルにインストール
npm install -g vite
npx vite
```

### npm install が失敗する

```bash
# キャッシュをクリア
npm cache clean --force

# レガシーピア依存関係を許可してインストール
npm install --legacy-peer-deps
```

### ブラウザで真っ白な画面

1. ブラウザのコンソール（F12）でエラーを確認
2. `npm run dev` のターミナル出力を確認
3. `localStorage.clear()` をコンソールで実行してリロード

## 🎯 開発の流れ

1. **起動**: `npm run dev`
2. **ブラウザを開く**: `http://localhost:5173`
3. **コード編集**: エディタでファイルを編集
4. **自動リロード**: 保存すると自動的にブラウザが更新
5. **停止**: ターミナルで `Ctrl+C`

## 📊 データの保存先

- **開発環境**: ブラウザの LocalStorage
- **本番環境**: Vercel Serverless Functions（メモリストレージ）

開発中のデータをリセット:
```javascript
// ブラウザのコンソール（F12）で実行
localStorage.clear()
location.reload()
```

## 🌐 本番環境（Vercel）との違い

| 項目 | ローカル | 本番（Vercel） |
|------|----------|----------------|
| データ | LocalStorage | メモリ/KV |
| API | 不要 | Serverless Functions |
| URL | localhost:5173 | vercel.app |
| 永続化 | ブラウザのみ | サーバー側 |

## 📝 次のステップ

- コードを編集して動作を確認
- 新機能を追加
- [OPTIMIZATION.md](OPTIMIZATION.md) で最適化方法を学ぶ
- [DEPLOYMENT.md](DEPLOYMENT.md) でデプロイ方法を確認

## 💡 よくある質問

**Q: npm install が遅い / 失敗する**
A: ローカルディスク（C:ドライブなど）にプロジェクトをコピーしてください

**Q: データが保存されない**
A: LocalStorageを使用しています。ブラウザのプライベートモードではデータが消えます

**Q: APIエラーが出る**
A: ローカルではAPIは不要です。すべてLocalStorageで動作します

**Q: ポートを変更したい**
A: `npm run dev -- --port 3000` で別のポートを指定できます

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
