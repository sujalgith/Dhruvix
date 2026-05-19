@echo off
title Dhruvix Dev Server
color 0A

echo.
echo  ██████╗ ██╗  ██╗██████╗ ██╗   ██╗██╗   ██╗██╗██╗  ██╗
echo  ██╔══██╗██║  ██║██╔══██╗██║   ██║██║   ██║██║╚██╗██╔╝
echo  ██║  ██║███████║██████╔╝██║   ██║██║   ██║██║ ╚███╔╝
echo  ██║  ██║██╔══██║██╔══██╗██║   ██║╚██╗ ██╔╝██║ ██╔██╗
echo  ██████╔╝██║  ██║██║  ██║╚██████╔╝ ╚████╔╝ ██║██╔╝ ██╗
echo  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝   ╚═══╝  ╚═╝╚═╝  ╚═╝
echo.
echo  Starting Dhruvix development environment...
echo  Client  ^>  http://localhost:5173
echo  Server  ^>  http://localhost:3001
echo.
echo  Press Ctrl+C to stop all servers.
echo  -------------------------------------------------------
echo.

cd /d "%~dp0"

:: Install root deps if needed
if not exist "node_modules" (
  echo  Installing root dependencies...
  call npm install
  echo.
)

:: Install client deps if needed
if not exist "client\node_modules" (
  echo  Installing client dependencies...
  call npm install --prefix client
  echo.
)

:: Install server deps if needed
if not exist "server\node_modules" (
  echo  Installing server dependencies...
  call npm install --prefix server
  echo.
)

npm run dev

pause
