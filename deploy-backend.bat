@echo off
REM Windows batch script to push backend to Hugging Face Space

echo ==========================================
echo Backend Deployment to Hugging Face Space
echo ==========================================
echo.

cd phase-II\backend\hf-space

echo Current commits to be pushed:
git log origin/main..HEAD --oneline
echo.

echo ==========================================
echo STEP 1: Get Your Hugging Face Token
echo ==========================================
echo.
echo 1. Open: https://huggingface.co/settings/tokens
echo 2. Click "New token"
echo 3. Name: "Backend Deployment"
echo 4. Access: Select "Write"
echo 5. Click "Generate token"
echo 6. Copy the token (starts with hf_...)
echo.

set /p HF_TOKEN="Enter your Hugging Face token: "

if "%HF_TOKEN%"=="" (
    echo Error: Token cannot be empty
    pause
    exit /b 1
)

echo.
echo ==========================================
echo STEP 2: Pushing to Hugging Face Space
echo ==========================================
echo.

git push https://anumhussain:%HF_TOKEN%@huggingface.co/spaces/anumhussain/backend main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo SUCCESS! Backend deployed to HF Space
    echo ==========================================
    echo.
    echo The Space will rebuild automatically (1-2 minutes)
    echo.
    echo Check status: https://huggingface.co/spaces/anumhussain/backend
    echo.
    echo After rebuild completes, test your app:
    echo https://hackathon-2-phase-2-three.vercel.app
    echo.
) else (
    echo.
    echo ==========================================
    echo ERROR: Push failed
    echo ==========================================
    echo.
    echo Please check:
    echo 1. Token has Write access
    echo 2. Token is valid and not expired
    echo 3. Internet connection is working
    echo.
)

pause
