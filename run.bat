@echo off
SETLOCAL

:: Check if Node.js is installed
node -v >nul 2>&1
IF ERRORLEVEL 1 (
    echo Node.js is not installed. Please install it from https://nodejs.org/ and run this script again.
    EXIT /B 1
)

:: Install necessary packages
echo Installing necessary packages...
call npm install
IF ERRORLEVEL 1 (
    echo An error occurred while installing the packages.
    EXIT /B 1
)

:: Compile TypeScript to JavaScript
echo Compiling TypeScript to JavaScript...
call npx tsc
IF ERRORLEVEL 1 (
    echo An error occurred while compiling TypeScript.
    EXIT /B 1
)

:: Run the JavaScript code
echo Running JavaScript code...
node dist/index.js
IF ERRORLEVEL 1 (
    echo An error occurred while running the JavaScript code.
    EXIT /B 1
)

ENDLOCAL
pause
