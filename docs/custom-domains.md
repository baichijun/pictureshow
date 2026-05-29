# 多平台部署与域名

本项目支持两个独立部署目标，各自使用专属域名，互不干扰。

## 部署目标

| 平台 | 域名 | 状态 | 构建命令 |
|------|------|------|----------|
| GitHub Pages | `ai.pictureshow-git.qiguangming.com` | 已启用 | `npm run build:github` |
| EdgeOne Pages | `ai.pictureshow-edgeone-qiguangming.com` | 待部署 | `npm run build:edgeone` |

域名配置源文件：`deploy/targets.json`  
各平台 CNAME：`deploy/github/CNAME`、`deploy/edgeone/CNAME`

---

## GitHub Pages（当前线上）

### DNS 配置

在域名服务商添加 **CNAME** 记录：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `ai.pictureshow-git` | CNAME | `baichijun.github.io` |

> CNAME 必须指向 `baichijun.github.io`，**不要**包含仓库名 `/pictureshow`。

### GitHub 仓库设置

- Settings → Pages → **Build and deployment** 选择 **GitHub Actions**
- 自定义域名填写：`ai.pictureshow-git.qiguangming.com`
- 推送 `main` 分支后 Actions 自动构建部署

### 验证

```bash
curl -I https://ai.pictureshow-git.qiguangming.com
```

---

## EdgeOne Pages（预留，尚未部署）

详见 [deploy/edgeone/README.md](../deploy/edgeone/README.md)。

本地预构建：

```bash
npm run sync
npm run build:edgeone
```

将 `dist/` 上传至 EdgeOne，并在控制台绑定 `ai.pictureshow-edgeone-qiguangming.com`。

---

## 注意事项

- `public/` 目录**不再**放置 `CNAME`，构建时由 `scripts/build-deploy.mjs` 按目标写入
- 请勿在仓库根目录创建 `CNAME`，否则会导致 Pages 发布源码
- 两个版本共用同一代码，更新图片后分别 `sync` + 构建 + 部署到对应平台即可
