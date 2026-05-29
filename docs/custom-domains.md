# 自定义域名配置

本项目通过 GitHub Pages 部署，支持以下访问方式。

## 主域名

| 域名 | 说明 |
|------|------|
| `qiguangming.com` | 主域名（`public/CNAME` 中配置） |

## 附加子域名

| 域名 | 说明 |
|------|------|
| `ai.pictureshow-git.qiguangming.com` | 指向同一首页 |

> GitHub Pages **每个仓库只能绑定一个自定义域名**，因此子域名需在 DNS 服务商处配置转发，指向主域名。

## DNS 配置（在域名服务商处操作）

### 1. 主域名 `qiguangming.com`（如已配置可跳过）

添加 4 条 **A 记录**，均指向 GitHub Pages IP：

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### 2. 子域名 `ai.pictureshow-git.qiguangming.com`

在 DNS 控制台添加 **URL 转发 / 301 重定向**：

| 字段 | 值 |
|------|-----|
| 主机记录 | `ai.pictureshow-git` |
| 记录类型 | URL 转发（或 301 重定向） |
| 目标地址 | `https://qiguangming.com` |

若 DNS 服务商不支持 URL 转发，可改用 **CNAME** 指向 `baichijun.github.io`，然后在 GitHub 仓库 Settings → Pages 中将自定义域名改为该子域名（会替换主域名）。

## 验证

配置生效后（通常 5–30 分钟，最长 24 小时）：

```bash
# 主域名
curl -I https://qiguangming.com

# 子域名（应 301 跳转到主域名）
curl -I https://ai.pictureshow-git.qiguangming.com
```

## 注意事项

- `public/CNAME` 文件只能包含一个域名，构建后会复制到 `dist/CNAME`
- 请勿在仓库根目录创建 `CNAME`，否则会导致 Pages 发布源码而非构建产物
- GitHub Pages 发布方式必须选择 **GitHub Actions**，不要选 “Deploy from a branch”
