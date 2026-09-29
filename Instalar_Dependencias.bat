@echo off
chcp 65001 >nul
title Instalador de Dependencias - Condominio Bloque 7
color 0B

cd /d "%~dp0"

echo ======================================================================
echo      INSTALADOR DE DEPENDENCIAS Y PREPARACION DE CONDOMINIO
echo ======================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
    ) else if exist "%LocalAppData%\Programs\nodejs\node.exe" (
        set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
    ) else (
        color 0C
        echo [ERROR] Node.js no esta instalado. Descarguelo desde https://nodejs.org
        pause
        exit /b 1
    )
)

echo [1/3] Limpiando cache previa si fuera necesario...
call npm cache clean --force >nul 2>nul

echo [2/3] Instalando dependencias completas del proyecto...
call npm install

echo [3/3] Verificando instalacion de ejecutables locales...
call npx tsx --version >nul 2>nul
if %errorlevel% neq 0 (
    echo Reasegurando tsx y vite...
    call npm install tsx vite --save-dev
)

echo.
echo ======================================================================
echo   INSTALACION COMPLETA.
echo   Ahora puede hacer doble clic en "Iniciar_Condominio.bat"
echo ======================================================================
echo.
pause
