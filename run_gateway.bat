@echo off
title CỔNG ĐIỀU PHỐI AI MIỄN PHÍ - GATEWAY RUNNING
echo ========================================================
echo       KHOI DONG GATEWAY AI CHO VIBE CODING (FREE)
echo ========================================================
echo Kiem tra va cap nhat LiteLLM...
pip install litellm
echo.
echo Dang khoi dong Gateway tai http://localhost:4000
echo Ban co the su dung URL nay trong Cursor, Cline, Roo Code...
echo.
echo Nhap Model ID trong IDE:
echo  - 'free-coder' (Qwen Coder + Fallback)
echo  - 'free-architect' (DeepSeek R1 + Fallback)
echo.
echo Nhan Ctrl+C de dung server.
echo ========================================================
litellm --config "%~dp0scratch\litellm_config.yaml" --port 4000
pause
