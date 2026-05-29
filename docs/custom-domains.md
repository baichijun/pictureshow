# 多平台部署与域名

本项目支持两个独立部署目标，各自使用专属域名，互不干扰。

## 部署目标

| 平台 | 域名 | 状态 | 构建命令 |
|------|------|------|----------|
| GitHub Pages | `ai-pictureshow-git.qiguangming.com` | 已启用 | `npm run build:github` |
| EdgeOne Pages | `ai.pictureshow-edgeone-qiguangming.com` | 待部署 | `npm run build:edgeone` |

域名配置源文件：`deploy/targets.json`  
各平台 CNAME：`deploy/github/CNAME`、`deploy/edgeone/CNAME`

---

## GitHub Pages（当前线上）

### DNS 配置（Cloudflare）

在 Cloudflare → `qiguangming.com` → **DNS** 添加：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| CNAME | `ai-pictureshow-git` | `baichijun.github.io` | 橙色或灰色云朵均可 |

> `ai-pictureshow-git.qiguangming.com` 是一级子域名，Cloudflare 免费 Universal SSL 可正常覆盖。

> CNAME 必须指向 `baichijun.github.io`，**不要**包含仓库名 `/pictureshow`。

### GitHub 仓库设置

- Settings → Pages → **Build and deployment** 选择 **GitHub Actions**
- 自定义域名填写：`ai-pictureshow-git.qiguangming.com`
- 推送 `main` 分支后 Actions 自动构建部署

### 验证

```bash
curl -I https://ai-pictureshow-git.qiguangming.com
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

## 故障排查

### `DNS_PROBE_FINISHED_NXDOMAIN`

本地 DNS（如小米路由器）未同步记录。将电脑 DNS 改为 `223.5.5.5` / `8.8.8.8`，执行 `ipconfig /flushdns`。

### `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`

若使用旧的多级子域名（如 `ai.pictureshow-git.qiguangming.com`）并开启 Cloudflare 橙色代理，免费 SSL 无法覆盖。请改用一级子域名 `ai-pictureshow-git.qiguangming.com`，或关闭代理（灰色云朵）。

GitHub 签发证书后，在仓库 Settings → Pages 可勾选 **Enforce HTTPS**。

## 注意事项

- `public/` 目录**不再**放置 `CNAME`，构建时由 `scripts/build-deploy.mjs` 按目标写入
- 请勿在仓库根目录创建 `CNAME`，否则会导致 Pages 发布源码
- 两个版本共用同一代码，更新图片后分别 `sync` + 构建 + 部署到对应平台即可
