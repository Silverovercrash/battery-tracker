@echo off
setlocal
cd /d "%~dp0"
echo Akku Tracker - lokale Offline-Vorschau
echo http://127.0.0.1:18775/akku_tracker/index.html
echo Dieses Fenster offen lassen. Beenden mit Strg+C.
echo.
python -m http.server 18775 --bind 127.0.0.1 --directory www
if errorlevel 1 pause
