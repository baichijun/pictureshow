# pictureshow 桌面同步工具

把"脚本所在的文件夹"当成一个图片集，**增量**同步到 pictureshow 网站。

## 它是怎么工作的？

pictureshow 是部署在 **GitHub Pages** 上的静态网站，图片的真正"后端"就是 GitHub 仓库
（`baichijun/pictureshow`）。仓库里 `picture/<相册名>/` 下的图片，会在每次推送后由
GitHub Actions 自动生成缩略图、写入 `albums.json` 并发布上线。

所以本工具通过 **GitHub Contents API**（网站的后端接口）来上传图片：

1. 取脚本/exe 所在文件夹的名字作为**相册名**；
2. 调用 API 查询网站上是否已有同名相册、以及已有哪些图片；
3. **相册不存在** → 创建并上传文件夹里的全部图片；
4. **相册已存在** → 只上传"本地有、网站上没有"的新图片（按文件名比对）；
5. 上传后 GitHub Actions 会自动构建并发布，几分钟后即可在网站看到新图片。

> 删除本地图片**不会**删除网站上的图片，符合 PRD 的要求。

## 准备：GitHub 访问令牌（只需一次）

上传需要一个对仓库有写权限的 **Personal Access Token (PAT)**：

1. 打开 <https://github.com/settings/tokens>
2. 生成一个 token（经典 token 勾选 `repo` 权限；细粒度 token 给该仓库 `Contents: Read and write`）
3. 第一次运行脚本时按提示粘贴该 token，它会被保存到你用户目录下的
   `~/.pictureshow-sync.json`，以后在任意文件夹运行都无需再次输入。

也可以通过环境变量提供（可选）：
`PICTURESHOW_TOKEN`、`PICTURESHOW_OWNER`、`PICTURESHOW_REPO`、`PICTURESHOW_BRANCH`。

默认仓库为 `baichijun/pictureshow`，分支 `main`。

## 用法 A：直接用 Python 运行（Windows / Mac / Linux 通用）

1. 确保已安装 **Python 3**（Windows 可在 <https://www.python.org/downloads/> 下载，安装时勾选 *Add to PATH*）。
2. 把 `pictureshow同步.py` 复制到某个**图片文件夹**里（该文件夹名就是相册名）。
3. 运行：
   - Windows：双击 `pictureshow同步.py`（或右键“用 Python 运行”）。
   - Mac/Linux：在该文件夹打开终端执行 `python3 pictureshow同步.py`。

> Mac 上若想做成可双击的 `.app`，最简单的方式是用 [py2app](https://py2app.readthedocs.io/)
> 或 `Automator` 包一层 `python3 脚本路径`；逻辑与本脚本完全一致。

## 用法 B：打包成 Windows 可执行文件（.exe）

1. 安装 Python 3。
2. 双击运行本目录下的 **`build-exe.bat`**（会自动安装 PyInstaller 并打包）。
   - 等价手动命令：
     ```bat
     pip install pyinstaller
     pyinstaller --onefile --console --name "pictureshow同步" "pictureshow同步.py"
     ```
3. 生成的 `dist\pictureshow同步.exe` 就是最终程序。
4. 把这个 `.exe` **复制到任意一个图片文件夹**中，**双击**即可把该文件夹同步到网站。

## 注意事项

- 仅同步文件夹**第一层**的图片文件，不递归子目录（与网站相册结构一致）。
- 支持的格式：`jpg jpeg png gif webp bmp tiff tif avif`。
- 比对依据是**文件名**：网站上已存在同名文件就跳过，只上传新增文件。
- 上传后请稍等几分钟（GitHub Actions 构建+发布）再刷新网站查看。
