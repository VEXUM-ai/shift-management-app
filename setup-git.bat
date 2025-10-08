@echo off
echo ========================================
echo Git Setup for Shift Management App
echo ========================================
echo.

REM Gitリポジトリの初期化チェック
if exist .git (
    echo Git repository already initialized.
) else (
    echo Initializing Git repository...
    git init
    echo Git repository initialized successfully!
)

echo.
echo Adding all files to Git...
git add .

echo.
echo Creating initial commit...
git commit -m "Initial commit: Shift management app with improvements"

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Create a new repository on GitHub
echo 2. Run the following commands:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/shift-management-app.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo ========================================
echo Setup complete!
echo ========================================
pause
