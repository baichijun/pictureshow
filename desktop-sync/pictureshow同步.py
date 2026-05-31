# -*- coding: utf-8 -*-
"""
pictureshow 同步工具
====================

把"脚本所在的文件夹"作为一个图片集，增量同步到 pictureshow 网站。

工作原理
--------
pictureshow 是一个部署在 GitHub Pages 上的静态网站，图片的"后端"就是 GitHub 仓库
本身：仓库 picture/<相册名>/ 目录下的图片，会在每次推送后由 GitHub Actions 自动
生成缩略图、写入 albums.json 并发布上线。

因此本脚本通过 GitHub Contents API（即网站的后端接口）来上传图片：
  1. 取脚本所在文件夹的名字作为相册名；
  2. 调用 API 查询仓库 picture/<相册名>/ 是否已存在、以及里面已有哪些图片；
  3. 若相册不存在  -> 创建并上传文件夹内全部图片；
  4. 若相册已存在  -> 只上传"本地有、网站上没有"的新图片；
  5. 上传完成后 GitHub Actions 会自动构建并发布到网站。

双击运行即可（Windows 上可用 build-exe.bat 打包成 .exe，Mac/Linux 直接 python3 运行）。

无第三方依赖，仅使用 Python 标准库。
"""

import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

# ----------------------------------------------------------------------------
# 默认配置（与当前仓库一致，可被用户配置文件 / 环境变量覆盖）
# ----------------------------------------------------------------------------
DEFAULT_OWNER = "baichijun"
DEFAULT_REPO = "pictureshow"
DEFAULT_BRANCH = "main"  # 推送到该分支会触发 GitHub Actions 部署

# 网站源图所在目录（仓库内）：picture/<相册名>/
REPO_PICTURE_DIR = "picture"

# 支持的图片扩展名（与网站 sync 脚本保持一致）
IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".tif", ".avif",
}

GITHUB_API = "https://api.github.com"

# 全局配置文件：存放 GitHub Token 等，只需填写一次，可反复用于任意文件夹
CONFIG_PATH = os.path.join(os.path.expanduser("~"), ".pictureshow-sync.json")


# ----------------------------------------------------------------------------
# 基础工具
# ----------------------------------------------------------------------------
def script_dir():
    """返回脚本（或打包后的 exe）真正所在的文件夹。"""
    if getattr(sys, "frozen", False):
        # PyInstaller 打包后的可执行文件
        return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))


def is_image(name):
    return os.path.splitext(name)[1].lower() in IMAGE_EXTENSIONS


def load_config():
    """读取配置：优先环境变量，其次用户主目录配置文件，缺失时交互式询问并保存。"""
    cfg = {
        "owner": os.environ.get("PICTURESHOW_OWNER", DEFAULT_OWNER),
        "repo": os.environ.get("PICTURESHOW_REPO", DEFAULT_REPO),
        "branch": os.environ.get("PICTURESHOW_BRANCH", DEFAULT_BRANCH),
        "token": os.environ.get("PICTURESHOW_TOKEN", ""),
    }

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                saved = json.load(f)
            for k in ("owner", "repo", "branch", "token"):
                if not cfg.get(k) and saved.get(k):
                    cfg[k] = saved[k]
        except (OSError, ValueError):
            pass

    # Token 是必填项，没有就交互式获取
    if not cfg["token"]:
        print("首次使用需要一个 GitHub 访问令牌(Personal Access Token)，")
        print("它需要对仓库 %s/%s 有写(contents)权限。" % (cfg["owner"], cfg["repo"]))
        print("生成地址: https://github.com/settings/tokens (勾选 repo 权限)")
        try:
            cfg["token"] = input("请粘贴你的 GitHub Token: ").strip()
        except EOFError:
            cfg["token"] = ""
        if cfg["token"]:
            save_config(cfg)
            print("Token 已保存到: %s（下次无需再次输入）\n" % CONFIG_PATH)

    return cfg


def save_config(cfg):
    try:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except OSError as e:
        print("警告: 无法保存配置文件: %s" % e)


# ----------------------------------------------------------------------------
# GitHub Contents API 封装
# ----------------------------------------------------------------------------
def api_request(method, path, token, body=None):
    """向 GitHub API 发起请求，返回 (status_code, parsed_json_or_None)。"""
    url = GITHUB_API + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "token %s" % token)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "pictureshow-sync")
    if data is not None:
        req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as resp:
            payload = resp.read().decode("utf-8")
            return resp.status, (json.loads(payload) if payload else None)
    except urllib.error.HTTPError as e:
        payload = e.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(payload) if payload else None
        except ValueError:
            parsed = {"message": payload}
        return e.code, parsed


def quote_path(path):
    """对仓库内路径做 URL 编码，保留 '/'（支持中文相册名/文件名）。"""
    return urllib.parse.quote(path, safe="/")


def list_remote_images(cfg, album_name):
    """
    查询网站上该相册已有的图片文件名集合。
    返回 (exists: bool, filenames: set)。相册不存在时 exists=False。
    """
    repo_path = "%s/%s" % (REPO_PICTURE_DIR, album_name)
    path = "/repos/%s/%s/contents/%s?ref=%s" % (
        cfg["owner"], cfg["repo"], quote_path(repo_path),
        urllib.parse.quote(cfg["branch"]),
    )
    status, data = api_request("GET", path, cfg["token"])

    if status == 404:
        return False, set()
    if status == 200 and isinstance(data, list):
        names = {item["name"] for item in data if item.get("type") == "file"}
        return True, names
    # 其它情况（权限/网络错误）抛出，便于上层提示
    msg = data.get("message") if isinstance(data, dict) else str(data)
    raise RuntimeError("查询相册失败 (HTTP %s): %s" % (status, msg))


def upload_image(cfg, album_name, file_path, file_name):
    """通过 Contents API 上传单张图片到 picture/<相册名>/<文件名>。"""
    with open(file_path, "rb") as f:
        content_b64 = base64.b64encode(f.read()).decode("ascii")

    repo_path = "%s/%s/%s" % (REPO_PICTURE_DIR, album_name, file_name)
    path = "/repos/%s/%s/contents/%s" % (
        cfg["owner"], cfg["repo"], quote_path(repo_path),
    )
    body = {
        "message": "sync: 上传 %s/%s" % (album_name, file_name),
        "content": content_b64,
        "branch": cfg["branch"],
    }
    status, data = api_request("PUT", path, cfg["token"], body)
    if status in (200, 201):
        return True
    msg = data.get("message") if isinstance(data, dict) else str(data)
    raise RuntimeError("上传失败 (HTTP %s): %s" % (status, msg))


# ----------------------------------------------------------------------------
# 主流程
# ----------------------------------------------------------------------------
def main():
    print("=" * 56)
    print("        pictureshow 同步工具")
    print("=" * 56)

    base = script_dir()
    album_name = os.path.basename(base.rstrip("\\/"))
    print("源文件夹: %s" % base)
    print("相册名称: %s\n" % album_name)

    # 1. 收集本地图片
    local_images = sorted(
        f for f in os.listdir(base)
        if os.path.isfile(os.path.join(base, f)) and is_image(f)
    )
    if not local_images:
        print("该文件夹内没有发现图片文件，无需同步。")
        return
    print("本地图片: %d 张" % len(local_images))

    # 2. 读取配置 / Token
    cfg = load_config()
    if not cfg["token"]:
        print("\n未提供 GitHub Token，无法上传。已退出。")
        return

    # 3. 查询网站上已有的图片
    try:
        exists, remote_names = list_remote_images(cfg, album_name)
    except RuntimeError as e:
        print("\n错误: %s" % e)
        print("请检查 Token 权限、仓库名(%s/%s)与网络连接。" % (cfg["owner"], cfg["repo"]))
        return

    if exists:
        print("网站已存在相册「%s」，已有 %d 张图片。" % (album_name, len(remote_names)))
        to_upload = [f for f in local_images if f not in remote_names]
    else:
        print("网站尚无相册「%s」，将创建并上传全部图片。" % album_name)
        to_upload = list(local_images)

    if not to_upload:
        print("\n网站已是最新，没有需要上传的新图片。")
        return

    # 4. 增量上传
    print("\n需要上传 %d 张新图片：" % len(to_upload))
    ok, fail = 0, 0
    for i, name in enumerate(to_upload, 1):
        sys.stdout.write("  [%d/%d] %s ... " % (i, len(to_upload), name))
        sys.stdout.flush()
        try:
            upload_image(cfg, album_name, os.path.join(base, name), name)
            print("完成")
            ok += 1
        except (RuntimeError, OSError) as e:
            print("失败: %s" % e)
            fail += 1

    print("\n" + "-" * 56)
    print("同步结束：成功 %d 张，失败 %d 张。" % (ok, fail))
    if ok:
        print("GitHub Actions 将自动构建并发布，稍等几分钟即可在网站看到新图片。")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001 - 顶层兜底，避免双击窗口闪退看不到错误
        print("\n发生未预期的错误: %s" % e)
    # 双击运行时暂停，方便查看输出
    try:
        input("\n按回车键关闭窗口...")
    except EOFError:
        pass
