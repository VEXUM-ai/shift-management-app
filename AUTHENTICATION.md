# ユーザー認証機能ドキュメント

## 📋 概要

シフト管理アプリケーションに本格的なユーザー認証機能を追加しました。各メンバーが自分のメールアドレスとパスワードでログインし、個人専用のダッシュボードにアクセスできるようになりました。

---

## 🎯 主な機能

### 1. パスワード認証
- **メールアドレス + パスワード**による認証
- パスワードは**SHA-256でハッシュ化**して保存
- セッション管理（24時間有効）

### 2. ロールベースアクセス制御
- **管理者（Admin）**: 全機能にアクセス可能
- **一般メンバー（Member）**: 自分のシフトと勤怠のみ

### 3. セキュリティ機能
- パスワード強度チェック（6文字以上、英数字必須）
- パスワード確認入力
- メールアドレス重複チェック
- セッション有効期限管理（24時間）
- 自動ログアウト（セッション期限切れ時）

---

## 🔐 認証フロー

### ログインプロセス

```
1. ユーザーがメールアドレスとパスワードを入力
   ↓
2. システムがメンバーデータからメールアドレスを検索
   ↓
3. 保存されたハッシュ化パスワードと照合
   ↓
4. 認証成功 → セッション作成 & トークン発行
   ↓
5. セッション情報をlocalStorageに保存
   ↓
6. ダッシュボードへリダイレクト
```

### ログアウトプロセス

```
1. ログアウトボタンをクリック
   ↓
2. セッション情報を削除
   ↓
3. 認証状態をリセット
   ↓
4. ログイン画面へリダイレクト
```

---

## 📁 ファイル構成

### 新規作成ファイル

#### 1. **types/auth.ts**
認証関連の型定義

```typescript
export interface User {
  id: number
  name: string
  email: string
  password?: string
  is_admin: boolean
  created_at?: string
  last_login?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}
```

#### 2. **utils/auth.ts**
認証ユーティリティ関数

主要な関数:
- `hashPassword(password: string)`: パスワードをSHA-256でハッシュ化
- `verifyPassword(password: string, hash: string)`: パスワードを検証
- `validatePasswordStrength(password: string)`: パスワード強度チェック
- `validateEmail(email: string)`: メールアドレス検証
- `generateSessionToken()`: セッショントークン生成
- `isSessionValid(timestamp: string)`: セッション有効期限チェック

#### 3. **components/Login.tsx**
ログインUIコンポーネント

機能:
- メールアドレス & パスワード入力フォーム
- パスワード表示/非表示切替
- リアルタイムバリデーション
- ローディング状態表示
- エラーメッセージ表示
- 管理者アクセスオプション

### 更新ファイル

#### 1. **App.tsx**
メイン認証ロジック

追加された機能:
- `handleLogin()`: ログイン処理
- `handleAdminLogin()`: 管理者ログイン
- `logout()`: ログアウト処理
- セッション自動復元
- セッション有効期限チェック

#### 2. **App.css**
ログインページのスタイル

追加されたスタイル:
- `.login-container`: ログインページコンテナ
- `.login-card`: ログインカード
- `.login-form`: ログインフォーム
- `.password-input-wrapper`: パスワード入力ラッパー
- `.toggle-password`: パスワード表示切替ボタン

---

## 🔧 使用方法

### メンバーの登録（管理者）

1. 管理者としてログイン
2. 「メンバー管理」タブを開く
3. 以下の情報を入力:
   - **名前** *（必須）*
   - **メールアドレス** *（必須、一意）*
   - **パスワード** *（必須、6文字以上、英数字含む）*
   - **パスワード確認** *（必須）*
   - オフィス交通費
   - 給与形態（時給制 or 固定給与制）
   - 時給 or 固定給与
   - 管理者権限
4. 「メンバー追加」ボタンをクリック

### メンバーのログイン

1. ログイン画面で以下を入力:
   - **メールアドレス**
   - **パスワード**
2. 「ログイン」ボタンをクリック
3. 認証成功 → 個人ダッシュボードへ

### 管理者ログイン

1. ログイン画面で「管理者としてアクセス」ボタンをクリック
2. パスワード不要で全機能にアクセス可能

### パスワードの変更

1. 管理者としてログイン
2. 「メンバー管理」タブを開く
3. 対象メンバーの「編集」ボタンをクリック
4. 新しいパスワードを入力
5. パスワード確認を入力
6. 「更新」ボタンをクリック

**注意**: 編集時、パスワードフィールドを空白にすると、パスワードは変更されません。

---

## 🔒 セキュリティ仕様

### パスワードハッシュ化

```typescript
// SHA-256を使用したハッシュ化
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
```

### パスワード要件

- **最小文字数**: 6文字
- **最大文字数**: 100文字
- **必須文字種**: 英字 + 数字

### セッション管理

```typescript
interface AuthSession {
  userId: number
  userName: string
  userEmail: string
  userRole: 'admin' | 'member'
  token: string         // ランダム生成トークン
  timestamp: string     // セッション作成時刻
}
```

- **有効期限**: 24時間
- **保存場所**: localStorage
- **キー**: `shift_app_auth_session`

---

## 📊 データ構造

### メンバーデータ

```typescript
{
  id: number,
  name: string,
  email: string,                    // 🆕 ログイン用
  password: string,                 // 🆕 ハッシュ化済み
  office_transport_fee: number,
  salary_type: 'hourly' | 'fixed',
  hourly_wage: number,
  fixed_salary: number,
  is_admin: boolean,
  created_at: string,               // 🆕 作成日時
  last_login: string                // 🆕 最終ログイン
}
```

---

## ⚠️ 重要な注意事項

### 1. フロントエンドのみの認証

**現在の実装はフロントエンドのみ**で動作します。

**セキュリティ上の制限**:
- ブラウザのDevToolsでlocalStorageを直接編集可能
- パスワードハッシュが盗まれると、他のシステムで悪用される可能性
- ネットワーク通信の暗号化なし

**本番環境では**:
- バックエンドAPI（Node.js, Python, etc.）の実装が必要
- HTTPS通信の必須化
- JWT（JSON Web Token）の使用
- bcryptなどの強力なハッシュ関数の使用
- レート制限（ブルートフォース攻撃対策）

### 2. パスワードリセット機能なし

現在、パスワードを忘れた場合:
- 管理者に連絡してパスワードを再設定してもらう必要があります

将来の改善案:
- メール送信機能を実装
- パスワードリセットリンクの発行

### 3. 二要素認証（2FA）なし

さらなるセキュリティ強化のため、将来的に以下の実装を検討:
- SMS認証
- Google Authenticator連携
- メールによるワンタイムパスワード

---

## 🧪 テスト手順

### 1. 新規メンバー登録のテスト

```
テストケース 1: 正常系
1. 管理者でログイン
2. メンバー管理で以下を入力:
   - 名前: "テストユーザー"
   - Email: "test@example.com"
   - Password: "test123"
   - Password確認: "test123"
   - 時給: "1500"
3. 登録成功を確認

テストケース 2: バリデーション
- パスワード不一致 → エラー表示
- パスワード6文字未満 → エラー表示
- メールアドレス重複 → エラー表示
- 必須項目未入力 → エラー表示
```

### 2. ログインのテスト

```
テストケース 1: 正常系
1. ログアウト
2. "test@example.com" / "test123" でログイン
3. ダッシュボード表示を確認
4. ヘッダーに"テストユーザー"と表示されることを確認

テストケース 2: 異常系
- 存在しないメールアドレス → エラー表示
- 間違ったパスワード → エラー表示
- 空フィールド → バリデーションエラー
```

### 3. セッション管理のテスト

```
テストケース 1: セッション継続
1. ログイン
2. ページをリロード
3. ログイン状態が維持されることを確認

テストケース 2: セッション期限切れ
1. LocalStorageでタイムスタンプを25時間前に変更
2. ページをリロード
3. 自動ログアウトされることを確認
```

### 4. パスワード変更のテスト

```
テストケース 1: 正常系
1. 管理者でログイン
2. メンバー編集画面を開く
3. 新しいパスワードを入力
4. 保存
5. ログアウトして新パスワードでログイン成功を確認

テストケース 2: パスワード変更しない
1. メンバー編集画面を開く
2. パスワードフィールドを空白のまま保存
3. 既存のパスワードでログインできることを確認
```

---

## 🚀 将来の改善案

### 短期（優先度: 高）

1. **パスワードリセット機能**
   - メールでリセットリンク送信
   - トークンベースの認証

2. **ログイン履歴**
   - ログイン日時の記録
   - ログイン失敗回数の追跡

3. **アカウントロック機能**
   - 5回連続失敗でアカウントロック
   - 30分後に自動解除

### 中期（優先度: 中）

1. **OAuth連携**
   - Google ログイン
   - Microsoft ログイン

2. **二要素認証（2FA）**
   - TOTP（Time-based OTP）
   - SMS認証

3. **パスワードポリシー強化**
   - 記号の必須化
   - 過去のパスワード再利用防止

### 長期（優先度: 低）

1. **バックエンドAPI実装**
   - Node.js + Express
   - PostgreSQL
   - JWT認証

2. **監査ログ**
   - すべての操作を記録
   - 不正アクセス検知

3. **権限の細分化**
   - ロール追加（スーパーバイザー、マネージャー等）
   - 機能ごとの権限設定

---

## 📖 API リファレンス

### 認証関数

#### `handleLogin(email, password)`
ユーザーログインを処理

**パラメータ**:
- `email: string` - メールアドレス
- `password: string` - パスワード

**戻り値**: `Promise<void>`

**エラー**:
- メールアドレスが存在しない
- パスワードが一致しない
- パスワードが未設定

**使用例**:
```typescript
try {
  await handleLogin('user@example.com', 'password123')
  // ログイン成功
} catch (error) {
  console.error(error.message)
}
```

#### `logout()`
ユーザーログアウトを処理

**戻り値**: `void`

**使用例**:
```typescript
logout()
```

### ユーティリティ関数

#### `hashPassword(password)`
パスワードをSHA-256でハッシュ化

**パラメータ**:
- `password: string` - 平文パスワード

**戻り値**: `Promise<string>` - ハッシュ化されたパスワード

#### `verifyPassword(password, hash)`
パスワードを検証

**パラメータ**:
- `password: string` - 平文パスワード
- `hash: string` - ハッシュ化されたパスワード

**戻り値**: `Promise<boolean>` - 一致する場合true

#### `validatePasswordStrength(password)`
パスワード強度をチェック

**パラメータ**:
- `password: string` - パスワード

**戻り値**: `{ valid: boolean; message: string }`

---

## 🐛 トラブルシューティング

### ログインできない

**問題**: 「メールアドレスまたはパスワードが正しくありません」

**解決策**:
1. メールアドレスのスペルを確認
2. パスワードの大文字小文字を確認
3. 管理者に確認してパスワードをリセット

---

### セッションがすぐに切れる

**問題**: ログイン直後にログアウトされる

**解決策**:
1. ブラウザのLocalStorageを確認
2. ブラウザの時計設定を確認
3. キャッシュとCookieをクリア

---

### パスワードを変更できない

**問題**: 編集画面でパスワードを変更できない

**解決策**:
1. パスワードと確認パスワードが一致しているか確認
2. 6文字以上の英数字を含むか確認

---

## 📞 サポート

問題が発生した場合:
1. このドキュメントを確認
2. [UI_UX_IMPROVEMENTS.md](UI_UX_IMPROVEMENTS.md) を確認
3. GitHub Issuesで報告

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
