@echo off
title NSUDC Website Server
echo.
echo ============================================
echo   NSU Debate Club Website Server
echo ============================================
echo.
echo Starting local development server...
echo Open your browser and visit: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
echo.
echo Server stopped.
pause