@echo off
chcp 65001 > nul
echo ==========================================
echo       PREPARANDO NUTRISTREAM APP
echo ==========================================
echo.
echo 1. Accediendo al directorio del proyecto...
cd /d "%~dp0"

echo 2. Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias por primera vez...
    call npm install
)

echo 3. Construyendo la aplicacion...
call npm run build -- --outDir "%~dp0visor" --base=./ --emptyOutDir
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la construccion de la app.
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo       INICIANDO SERVIDOR
echo ==========================================
echo.
echo IMPORTANTE:
echo 1. Se instalara un pequeño servidor web si no existe.
echo 2. La aplicacion se abrira en tu navegador automaticamente.
echo 3. MANTEN ESTA VENTANA ABIERTA mientras uses la app.
echo.

:: Usamos 'serve' para crear un servidor web local y evitar bloqueos de seguridad del navegador
cd /d "%~dp0visor"
call npx -y serve .

pause
