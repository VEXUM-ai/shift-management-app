# エラー修正ガイド

## 🚨 「エラーが発生しました」と表示される場合

### 原因

Googleドライブ上でnpm installが正常に動作しないため、フロントエンドの依存パッケージがインストールされていません。

### 解決方法

#### 方法1: プロジェクトをローカルディスクにコピー（推奨）

1. **プロジェクト全体をコピー**
   ```
   元の場所: H:\マイドライブ\shift-management-app
   コピー先: C:\shift-management-app
   ```

2. **コマンドプロンプトを開く**
   ```cmd
   cd C:\shift-management-app\frontend
   npm install
   npm run dev
   ```

3. **ブラウザでアクセス**
   ```
   http://localhost:5173
   ```

#### 方法2: バックエンドなしで動作させる（最も簡単）

フロントエンドはlocalStorageを使用して動作するため、バックエンドなしでも使用可能です。

1. **App.tsxのimportエラーを修正**

`frontend/src/App.tsx`の4行目を削除またはコメントアウト:

```typescript
// 削除または無効化
// import { Login } from './components/Login'
```

2. **ログイン画面を無効化**

`frontend/src/App.tsx`の212-222行目を以下のように変更:

```typescript
// ログイン画面を一時的に無効化
if (!isAuthenticated) {
  // 自動ログイン
  handleAdminLogin()
}
```

または、完全に削除:

```typescript
// この部分を削除
/*
if (!isAuthenticated) {
  return (
    <ErrorBoundary>
      <Login
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
        showAdminOption={true}
      />
    </ErrorBoundary>
  )
}
*/
```

そして110-143行目のuseEffectを以下のように変更:

```typescript
useEffect(() => {
  const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS)

  if (storedMembers) {
    try {
      const parsed = JSON.parse(storedMembers)
      setMembers(Array.isArray(parsed) ? parsed : [])
    } catch (error) {
      console.error('Error parsing members:', error)
      setMembers([])
    }
  }

  // 自動的に管理者としてログイン
  handleAdminLogin()
}, [])
```

3. **ブラウザで直接開く**

`frontend/index.html`をダブルクリックしてブラウザで開く

---

## ⚡ 最速の解決方法（簡易版）

以下のコマンドを実行してエラーを修正:

### 1. Login コンポーネントのインポートを削除

`frontend/src/App.tsx`を開いて、3行目を削除:

```typescript
// この行を削除
import { Login } from './components/Login'
```

### 2. 認証を自動化

`frontend/src/App.tsx`の110行目あたりのuseEffectに追加:

```typescript
useEffect(() => {
  const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS)

  if (storedMembers) {
    try {
      const parsed = JSON.parse(storedMembers)
      setMembers(Array.isArray(parsed) ? parsed : [])
    } catch (error) {
      console.error('Error parsing members:', error)
      setMembers([])
    }
  }

  // この行を追加
  setIsAuthenticated(true)
  setUserRole('admin')
}, [])
```

### 3. ログイン画面をスキップ

`frontend/src/App.tsx`の212-222行目をコメントアウト:

```typescript
/*
if (!isAuthenticated) {
  return (
    <ErrorBoundary>
      <Login
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
        showAdminOption={true}
      />
    </ErrorBoundary>
  )
}
*/
```

### 4. ブラウザをリロード

Ctrl + F5 で強制リロード

---

## 📝 完全な修正版コード

以下のコードで`frontend/src/App.tsx`の該当部分を置き換えてください:

### useEffect部分（110行目あたり）

```typescript
useEffect(() => {
  const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS)

  if (storedMembers) {
    try {
      const parsed = JSON.parse(storedMembers)
      setMembers(Array.isArray(parsed) ? parsed : [])
    } catch (error) {
      console.error('Error parsing members:', error)
      setMembers([])
    }
  }

  // 自動ログイン（開発用）
  setIsAuthenticated(true)
  setUserRole('admin')
  setAuthSession({
    userId: 0,
    userName: '管理者',
    userEmail: 'admin@local',
    userRole: 'admin',
    token: 'local-dev-token',
    timestamp: new Date().toISOString()
  })
}, [])
```

### ログイン画面の削除（212-222行目）

```typescript
// 完全にこのブロックを削除またはコメントアウト
/*
if (!isAuthenticated) {
  return (
    <ErrorBoundary>
      <Login
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
        showAdminOption={true}
      />
    </ErrorBoundary>
  )
}
*/
```

---

## 🔄 変更を元に戻す場合

1. GitHubから最新版をクローン
2. または、`git checkout frontend/src/App.tsx`で元に戻す

---

## 💡 ヒント

- **開発中は簡易版で動作確認**
- **本番環境ではローカルディスクにコピーしてから使用**
- **バックエンドAPIを使用する場合は別途セットアップが必要**

---

## 📞 サポート

それでも問題が解決しない場合:

1. ブラウザのコンソール（F12）でエラーを確認
2. エラーメッセージをコピー
3. GitHub Issuesで報告

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
