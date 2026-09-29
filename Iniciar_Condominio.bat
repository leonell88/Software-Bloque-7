@echo off
chcp 65001 >nul
title Servidor Condominio Bloque 7 Los Cocalitos
color 0A

:: 1. Ir a la carpeta donde esta este archivo .bat
cd /d "%~dp0"

echo ======================================================================
echo    INICIANDO SISTEMA DE CONDOMINIO - BLOQUE 7 LOS COCALITOS
echo ======================================================================
echo.

:: 2. Si el .bat se ejecuto en Downloads, buscar subcarpeta que contenga package.json
if not exist "package.json" (
    for /d %%D in (*) do (
        if exist "%%D\package.json" (
            echo Detectado proyecto en la subcarpeta: %%D
            cd /d "%~dp0%%D"
            goto :encontrado
        )
    )
    for /d %%D in (*\*) do (
        if exist "%%D\package.json" (
            echo Detectado proyecto en la subcarpeta: %%D
            cd /d "%~dp0%%D"
            goto :encontrado
        )
    )
    color 0C
    echo [ERROR CRITICO] No se encontro el archivo package.json.
    echo Carpeta actual: %cd%
    echo.
    echo SOLUCION: Copia este archivo "Iniciar_Condominio.bat" DENTRO de la
    echo carpeta descomprimida del proyecto (donde ves package.json y server.ts).
    echo.
    pause
    exit /b 1
)

:encontrado
echo [OK] Carpeta del proyecto localizada: %cd%
echo.

:: 3. Detectar Node.js
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
        echo [ERROR] No se encontro Node.js en el sistema.
        echo Por favor instale Node.js desde https://nodejs.org
        pause
        exit /b 1
    )
)

:: 4. Verificar e instalar dependencias si faltan
if not exist "node_modules\" (
    echo [1/3] Instalando librerias necesarias por primera vez (espere 1-2 minutos)...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Fallo npm install. Verifique conexion a internet para la descarga inicial.
        pause
        exit /b 1
    )
    echo [OK] Librerias instaladas con exito.
    echo.
) else (
    echo [1/3] Librerias verificadas (node_modules presente).
)

:: 5. Abrir navegador automaticamente
start "" /b cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:3000"

:: 6. Iniciar servidor
echo [2/3] Iniciando el servidor local...
echo ======================================================================
echo   SISTEMA ACTIVO: Abriendo navegador en http://localhost:3000 ...
echo   [IMPORTANTE] NO CIERRE ESTA VENTANA mientras use el sistema.
echo ======================================================================
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo Probando modo compilacion previa...
    call npm run build
    call node dist/server.cjs
)

echo.
echo El servidor se ha detenido.
pause
