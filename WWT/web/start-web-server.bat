@echo off
setlocal enabledelayedexpansion

title OpenSpace Tablet Interface Server

echo ========================================================
echo         OpenSpace Tablet Guest Interface Server         
echo ========================================================
echo.

:: Check if node_modules exists, run npm install if missing
if not exist "node_modules\" (
    echo Step 1/3: First run detected. Installing dependencies...
    call npm init -y
    call npm install express ws
    echo.
) else (
    echo Step 1/3: Dependencies verified.
)

:: Find local IPv4 address
echo Step 2/3: Detecting Host IP Address...
set HOST_IP=127.0.0.1
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set temp_ip=%%a
    set temp_ip=!temp_ip:~1!
    if not "!temp_ip!"=="127.0.0.1" (
        set HOST_IP=!temp_ip!
    )
)

echo.
echo ========================================================
echo Step 3/3: SERVER READY!
echo ========================================================
echo.
echo Connect your tablet web browser to:
echo.
echo     http://%HOST_IP%:5000
echo.
echo (Or locally on this PC: http://localhost:5000)
echo.
echo Press CTRL+C in this window to stop the server.
echo ========================================================
echo.

:: 3. Start Node.js Server
node server.js

pause