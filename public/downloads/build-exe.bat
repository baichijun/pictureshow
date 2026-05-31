@echo off
chcp 65001 >nul
REM ============================================================
REM  将 pictureshow同步.py 打包成 Windows 可执行文件 (.exe)
REM  双击本 bat 即可自动安装 PyInstaller 并完成打包。
REM ============================================================

cd /d "%~dp0"

echo [1/2] 安装/更新 PyInstaller ...
REM 直接调用 pip / pyinstaller，避免 "python -m" 在部分环境下被拆成单独执行 m
pip install --upgrade pyinstaller
if errorlevel 1 (
    echo.
    echo 安装 PyInstaller 失败。若提示找不到 pip，请改用: py -m pip install --upgrade pyinstaller
    pause
    exit /b 1
)

echo.
echo [2/2] 开始打包 ...
REM 先用 ASCII 名称打包，再重命名为中文 exe，避免批处理解析中文参数出错
pyinstaller --onefile --console --name pictureshow-sync --clean --noconfirm pictureshow同步.py
if errorlevel 1 (
    echo.
    echo PyInstaller 打包失败，请查看上方日志。
    pause
    exit /b 1
)

if exist "dist\pictureshow-sync.exe" (
    if exist "dist\pictureshow同步.exe" del /f /q "dist\pictureshow同步.exe"
    ren "dist\pictureshow-sync.exe" "pictureshow同步.exe"
)

echo.
if exist "dist\pictureshow同步.exe" (
    echo 打包完成！可执行文件位于: %~dp0dist\pictureshow同步.exe
    echo 把该 exe 复制到任意一个图片文件夹中，双击即可把该文件夹同步到网站。
) else (
    echo 打包似乎未成功，请查看上面的日志。
)
pause
