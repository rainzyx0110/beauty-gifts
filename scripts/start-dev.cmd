@echo off
rem 启动开发服务器，日志输出到 %TEMP%\gift-dev.log
cd /d "%~dp0.."
npm run dev > "%TEMP%\gift-dev.log" 2>&1
