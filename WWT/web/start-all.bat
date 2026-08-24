@echo off
title Launching OpenSpace and Web Server

:: Resolve the OpenSpace root folder (5 levels up from user\data\assets\WWT\web)
set "ROOT_DIR=%~dp0..\..\..\..\.."

echo Starting Node.js Server...
start start-web-server.bat

echo Starting OpenSpace with profile...
cd /d "%ROOT_DIR%\bin"

:: Start OpenSpace using relative paths derived from ROOT_DIR
start OpenSpace.exe -p "%ROOT_DIR%\user\data\profiles\WWT_Replacement.profile" -c "%ROOT_DIR%\user\config\WWT_Fullscreen.json" -b

echo Done! Both processes have been launched.