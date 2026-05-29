# Picture Show

私人图片纪录展示网站 — 基于 React + TypeScript + Vite + Tailwind CSS 构建。

## 功能

- 在 `picture/` 文件夹中按子文件夹组织图片集
- 自动同步脚本生成 1024×768 浏览版缩略图，点击可查看原图
- 首页每行展示一个图片集，封面为第一张图，标题附带图片数量
- 灯箱浏览支持上下张切换与过渡动画
- 管理端支持重命名、隐藏、删除、排序（密码保护）
- 禁止搜索引擎索引（robots.txt + meta noindex）

## 快速开始

```bash
# 安装依赖
npm install

# 生成示例图片（可选）
node scripts/create-sample.mjs

# 同步 picture/ 文件夹中的图片
npm run sync

# 启动开发服务器
npm run dev
```

## 添加图片

1. 在 `picture/` 下创建子文件夹（文件夹名即相册标题）
2. 将图片放入子文件夹（支持 jpg、png、gif、webp 等常见格式）
3. 运行 `npm run sync` 同步到网站
4. 或使用 `npm run sync:watch` 持续监听文件夹变化

## 管理

- 访问 `/admin/login` 登录管理面板
- 默认密码：`pictureshow`（请在 `src/config/admin.ts` 中修改）
- 管理配置保存在浏览器 localStorage，可导出为 `overrides.json`

## 部署

```bash
npm run sync
npm run build
```

将 `dist/` 目录部署到任意静态托管服务（GitHub Pages、Vercel 等）。

## 自定义域名

| 域名 | 角色 |
|------|------|
| `qiguangming.com` | 主域名 |
| `ai.pictureshow-git.qiguangming.com` | 附加子域名（DNS 301 转发至主域名） |

详细 DNS 配置见 [docs/custom-domains.md](docs/custom-domains.md)。

## 技术栈

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Framer Motion
- React Router
- Sharp（图片处理）
