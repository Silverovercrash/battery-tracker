@echo off
setlocal
cd /d "%~dp0"
echo Battery and Cell Tracker - local offline preview
echo http://127.0.0.1:18775/akku_tracker/index.html?lang=en
echo Leave this window open. Press Ctrl+C to stop.
echo.
python -m http.server 18775 --bind 127.0.0.1 --directory www
if errorlevel 1 pause
