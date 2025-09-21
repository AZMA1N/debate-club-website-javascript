# NSUDC Website Start Script
# This script starts a local development server for the NSUDC website

Write-Host "🚀 Starting NSUDC Website Development Server..." -ForegroundColor Cyan
Write-Host "📁 Project Directory: $(Get-Location)" -ForegroundColor Yellow

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.x" -ForegroundColor Red
    Write-Host "📥 Download from: https://python.org/downloads" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Stop any existing Python HTTP servers
Write-Host "🔄 Stopping existing servers..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*http.server*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Start the server
Write-Host "🌐 Starting HTTP server on port 8000..." -ForegroundColor Green
Write-Host "🔗 Open your browser and visit: http://localhost:8000" -ForegroundColor Cyan
Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start server in foreground so user can see output and stop with Ctrl+C
try {
    python -m http.server 8000
} catch {
    Write-Host "❌ Failed to start server: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Server stopped. Thanks for using NSUDC Website!" -ForegroundColor Green