@echo off
TITLE SHRI DHURGAI TRANS - Billing Agent
SETLOCAL

echo ===================================================
echo   SHRI DHURGAI TRANS - INTELLIGENT BILLING AGENT
echo ===================================================
echo.

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! 
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Check if node_modules exists, if not run npm install
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
)

:: Start the application in a new window
echo [INFO] Starting the Billing Agent...
echo [INFO] Once the server starts, the application will open in your browser.
echo.

:: We use "npm run dev" as it handles ts-node automatically
:: Start the server in the background and wait a moment before opening browser
start /b cmd /c "npm run dev"

:: Wait for server to initialize (approx 5 seconds)
timeout /t 5 /nobreak >nul

:: Open the browser
start http://localhost:3000

echo.
echo [SUCCESS] Application is running!
echo [INFO] Keep this window open while using the application.
echo [INFO] Press Ctrl+C in this window to stop the server.
echo.

:: Keep window open if crash occurs
cmd /k
