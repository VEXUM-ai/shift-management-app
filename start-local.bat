@echo offH:\マイドライブ\shift-management-app

chcp 65001 >nul
echo ========================================
echo   シフト管理アプリ - ローカル起動
echo ========================================
echo.

echo [1/3] プロジェクトディレクトリを確認中...
cd /d "%~dp0frontend"
if not exist "package.json" (
    echo ❌ エラー: frontend/package.json が見つかりません
    pause
    exit /b 1
)
echo ✓ プロジェクトディレクトリを確認しました

echo.
echo [2/3] node_modules を確認中...
if not exist "node_modules\" (
    echo ⚠️  node_modules が見つかりません
    echo.
    echo Googleドライブ上での npm install は推奨されません。
    echo.
    echo 【推奨】以下の手順を実行してください:
    echo 1. プロジェクトをローカルディスク（C:\など）にコピー
    echo 2. コピー先で npm install を実行
    echo 3. npm run dev を実行
    echo.
    echo 詳細は LOCAL_SETUP.md を参照してください
    echo.
    choice /C YN /M "それでもインストールを試みますか？(Y/N)"
    if errorlevel 2 goto :END
    if errorlevel 1 goto :INSTALL
) else (
    echo ✓ node_modules を確認しました
    goto :START
)

:INSTALL
echo.
echo [インストール中] これには時間がかかる場合があります...
npm install --legacy-peer-deps
if errorlevel 1 (
    echo.
    echo ❌ インストールに失敗しました
    echo.
    echo 【解決方法】
    echo 1. プロジェクトをC:\などのローカルディスクにコピー
    echo 2. コピー先で npm install を実行
    echo.
    pause
    exit /b 1
)

:START
echo.
echo [3/3] 開発サーバーを起動中...
echo.
echo ========================================
echo   ✓ 準備完了！
echo ========================================
echo.
echo   ブラウザで以下のURLにアクセスしてください:
echo   http://localhost:5173
echo.
echo   サーバーを停止するには Ctrl+C を押してください
echo.
echo ========================================
echo.

npm run dev

:END
pause
