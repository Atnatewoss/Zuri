@echo off
echo Starting Render Keep-Alive Service...
if "%BACKEND_HEALTH_URL%"=="" (
  echo BACKEND_HEALTH_URL is not set.
  echo Example:
  echo set BACKEND_HEALTH_URL=https://your-backend.onrender.com/health
  pause
  exit /b 1
)
node keep_alive.js
pause
