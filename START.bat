@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   常駐人材管理システム - 起動スクリプト
echo ========================================
echo.
echo フロントエンド開発サーバーを起動します...
echo.

cd frontend

REM 依存関係が未インストールの場合はインストール
if not exist "node_modules\" (
    echo 📦 依存関係をインストール中...
    call npm install
    echo.
)

echo 🚀 開発サーバーを起動中...
echo.
echo ブラウザで http://localhost:3000 を開いてください
echo 終了するには Ctrl+C を押してください
echo.

call npm run dev

pause
