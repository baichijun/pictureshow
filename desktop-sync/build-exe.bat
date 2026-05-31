@echo off
chcp 65001 >nul
REM ============================================================
REM  将 pictureshow同步.py 打包成 Windows 可执行文件 (.exe)
REM  双击本 bat 即可自动安装 PyInstaller 并完成打包。
REM ============================================================

cd /d "%~dp0"

echo [1/2] 安装/更新 PyInstaller ...
python -m pip install --upgrade pyinstaller
if errorlevel 1 (
    echo.
    echo 安装 PyInstaller 失败，请确认已安装 Python 并配置好 pip。
    pause
    exit /b 1
)

echo.
echo [2/2] 开始打包 ...
REM --onefile  : 打包成单个 exe
REM --console  : 保留控制台窗口以显示同步进度
REM --name     : 输出文件名
python -m PyInstaller --onefile --console --name "pictureshow同步" "pictureshow同步.py"

echo.
if exist "dist\pictureshow同步.exe" (
    echo 打包完成！可执行文件位于: %~dp0dist\pictureshow同步.exe
    echo 把该 exe 复制到任意一个"图片文件夹"中，双击即可把该文件夹同步到网站。
) else (
    echo 打包似乎未成功，请查看上面的日志。
)
pause
