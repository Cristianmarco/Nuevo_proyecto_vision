@echo off
setlocal enabledelayedexpansion
cd /d "C:\Users\pc3\Desktop\Nuevo_proyecto_vision"

set /p MSG="Ingrese el mensaje para el punto seguro: "

for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
    set day=%%a
    set month=%%b
    set year=%%c
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set hour=%%a
    set minute=%%b
)

set TIMESTAMP=!year!-!month!-!day!_!hour!-!minute!

git add .
git commit -m "%MSG% | !TIMESTAMP!"

echo.
echo ✅ Punto seguro creado con mensaje: %MSG% | !TIMESTAMP!
pause
