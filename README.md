# シフト管理・勤怠管理・給与計算アプリ

シフト提出、勤怠管理、給与計算を一元管理できるWebアプリケーションです。

## 機能

### 1. シフト管理
- シフトの提出（日付、開始時間、終了時間）
- 提出済みシフトの一覧表示
- シフトの編集・削除

### 2. 勤怠管理
- 出勤・退勤の打刻
- 勤務時間の自動計算
- 勤怠履歴の表示

### 3. 給与計算
- 時給と勤務時間から給与を計算
- 給与履歴の保存・表示
- 月別の給与管理

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- CSS3

### バックエンド
- Node.js
- Express
- TypeScript
- SQLite3

## セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd shift-management-app
```

2. 依存パッケージをインストール
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 開発環境の起動

ルートディレクトリから以下のコマンドを実行すると、フロントエンドとバックエンドが同時に起動します：

```bash
npm run dev
```

または、個別に起動：

```bash
# フロントエンド（ポート5173）
npm run dev:frontend

# バックエンド（ポート3000）
npm run dev:backend
```

## API エンドポイント

### シフト管理
- `GET /api/shifts` - 全シフト取得
- `POST /api/shifts` - シフト作成
- `PUT /api/shifts/:id` - シフト更新
- `DELETE /api/shifts/:id` - シフト削除

### 勤怠管理
- `GET /api/attendance` - 全勤怠記録取得
- `POST /api/attendance/clock-in` - 出勤打刻
- `PUT /api/attendance/clock-out/:id` - 退勤打刻
- `DELETE /api/attendance/:id` - 勤怠記録削除

### 給与計算
- `GET /api/salary` - 全給与記録取得
- `POST /api/salary/calculate` - 給与計算
- `GET /api/salary/:employee/:month` - 従業員・月別給与取得
- `DELETE /api/salary/:id` - 給与記録削除

## データベース

SQLiteを使用しています。データベースファイルは `backend/data.db` に作成されます。

### テーブル構造

**shifts（シフト）**
- id: 主キー
- employee_name: 従業員名
- date: 日付
- start_time: 開始時間
- end_time: 終了時間
- status: ステータス
- created_at: 作成日時

**attendance（勤怠）**
- id: 主キー
- employee_name: 従業員名
- date: 日付
- clock_in: 出勤時刻
- clock_out: 退勤時刻
- total_hours: 勤務時間
- created_at: 作成日時

**salary（給与）**
- id: 主キー
- employee_name: 従業員名
- month: 月
- hourly_wage: 時給
- total_hours: 総勤務時間
- total_salary: 総給与
- created_at: 作成日時

## ライセンス

MIT
