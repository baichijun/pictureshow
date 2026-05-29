# EdgeOne Pages 部署（待启用）

> 状态：**未部署**。构建脚本已就绪，域名配置见 `deploy/targets.json`。

## 域名

`ai.pictureshow-edgeone-qiguangming.com`

## 本地构建

```bash
npm run sync
npm run build:edgeone
```

产物在 `dist/`，已包含：

- `CNAME`（EdgeOne 域名）
- `404.html`（SPA 路由回退）
- `data/deploy-info.json`（部署元信息）

## EdgeOne 控制台步骤（部署时）

1. 登录 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 创建 **Pages** 项目（或与现有站点关联）
3. 上传 `dist/` 目录，或关联 CI 自动部署
4. **自定义域名** → 添加 `ai.pictureshow-edgeone-qiguangming.com`
5. 按控制台提示在 DNS 添加 CNAME 记录

## DNS 记录示例

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `ai.pictureshow-edgeone-qiguangming` | CNAME | EdgeOne 控制台提供的 CNAME 目标 |

## 与 GitHub Pages 版本的区别

| 项目 | GitHub Pages | EdgeOne |
|------|--------------|---------|
| 域名 | `ai.pictureshow-git.qiguangming.com` | `ai.pictureshow-edgeone-qiguangming.com` |
| 构建命令 | `npm run build:github` | `npm run build:edgeone` |
| 触发方式 | push 到 `main` 自动部署 | 手动上传或后续配置 CI |

两个版本使用**同一代码库**，仅 CNAME / 部署目标不同，便于并行维护多个版本。
