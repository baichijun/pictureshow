import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/** 区块卡片 - 可复用的内容容器 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="mb-8 rounded-2xl border border-[#262626] bg-[#111111] p-6 sm:p-8"
    >
      <h2 className="mb-4 text-xl font-semibold sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#a3a3a3] sm:text-base">{children}</div>
    </motion.section>
  )
}

/** 技术标签 */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-[#262626] bg-black px-3 py-1 text-xs text-[#d4d4d4]">
      {children}
    </span>
  )
}

/** 说明页 - 介绍项目技术特点与使用方法 */
export default function Guide() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold sm:text-4xl">
          <span className="gradient-text">使用说明</span>
        </h1>
        <p className="mt-3 text-[#a3a3a3]">
          一个私人图片相册展示网站：照片作为静态资源随站发布，按文件夹组织相册，支持缩放浏览与桌面一键同步。
        </p>
      </motion.div>

      <Section title="这是什么">
        <p>
          Picture Show 是一个<span className="text-white">私人图片相册网站</span>。每个文件夹是一个相册，文件夹名作为相册标题，
          首张图片作为封面。图片不依赖任何网盘或对象存储，而是作为网站的静态资源直接发布，访问快、隐私可控。
        </p>
        <p>网站对搜索引擎关闭收录（robots 全站 Disallow），适合私人记录与分享给特定的人。</p>
      </Section>

      <Section title="技术特点与亮点">
        <div className="mb-4 flex flex-wrap gap-2">
          <Tag>React 19</Tag>
          <Tag>TypeScript</Tag>
          <Tag>Vite</Tag>
          <Tag>Tailwind CSS</Tag>
          <Tag>Framer Motion</Tag>
          <Tag>Sharp 缩略图</Tag>
          <Tag>GitHub Actions</Tag>
          <Tag>GitHub Pages</Tag>
        </div>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-white">「仓库即后端」的静态架构：</span>
            图片随站发布，无需服务器，成本低、加载快。
          </li>
          <li>
            <span className="text-white">增量同步：</span>
            通过 MD5 / 文件名校验，只处理新增或变更的图片；删除本地文件不会删除线上图片。
          </li>
          <li>
            <span className="text-white">双尺寸图片：</span>
            列表用 1024×768 缩略图，点开看原图，兼顾流畅与清晰。
          </li>
          <li>
            <span className="text-white">图片懒加载：</span>
            原生懒加载 + 异步解码 + 骨架占位淡入，滚动更顺滑、首屏更快。
          </li>
          <li>
            <span className="text-white">强大的看图体验：</span>
            灯箱支持滚轮缩放、移动端双指缩放（25%～3000%）、拖拽平移、上下张切换与过渡动效。
          </li>
          <li>
            <span className="text-white">轻量管理端：</span>
            可重命名相册、隐藏、排序、软删除，支持导出配置持久化。
          </li>
          <li>
            <span className="text-white">自动化部署：</span>
            推送到 main 后 GitHub Actions 自动生成缩略图、构建并发布。
          </li>
          <li>
            <span className="text-white">桌面同步工具：</span>
            任意文件夹放入同步程序双击即可，通过 GitHub API 增量上传成相册。
          </li>
        </ul>
      </Section>

      <Section title="如何浏览">
        <ul className="list-disc space-y-2 pl-5">
          <li>首页每行展示一个相册，标题后括号内是图片数量。</li>
          <li>点击相册进入详情页，网格展示所有缩略图。</li>
          <li>点击任意缩略图打开大图灯箱。</li>
          <li>
            灯箱内：<span className="text-white">电脑</span>用鼠标滚轮缩放、双击放大、按住拖拽平移；
            <span className="text-white">手机</span>用双指捏合缩放、单指拖动平移；
            左右箭头或键盘 ←/→ 切换，Esc 关闭。
          </li>
        </ul>
      </Section>

      <Section title="如何添加照片（两种方式）">
        <p className="text-white">方式一：桌面同步工具（推荐，无需克隆整个项目）</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>在管理页下载同步工具（见下一节），或从仓库 desktop-sync 获取。</li>
          <li>把工具放进一个图片文件夹中，文件夹名即相册名。</li>
          <li>双击运行，首次按提示粘贴 GitHub Token（需写入权限）。</li>
          <li>新相册上传全部图片；已有相册只上传新增图片。</li>
          <li>等 1～2 分钟自动部署完成后刷新网站。</li>
        </ol>
        <p className="mt-3 text-white">方式二：在项目仓库里同步</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>在 picture/ 下新建子文件夹并放入图片。</li>
          <li>运行 <code className="text-indigo-400">npm run sync</code> 生成缩略图与数据。</li>
          <li>提交并推送到 main 分支，等待自动部署。</li>
        </ol>
      </Section>

      <Section title="管理与同步工具下载">
        <p>
          点击右上角的<span className="text-white"> 齿轮图标 </span>进入管理页（需输入管理密码）。
          在管理页可以重命名相册、隐藏、调整图片顺序、删除图片，并
          <span className="text-white">下载桌面同步工具</span>。
        </p>
        <Link
          to="/admin"
          className="mt-2 inline-block rounded-lg border border-[#262626] px-4 py-2 text-sm text-[#d4d4d4] transition-colors hover:border-[#404040] hover:text-white"
        >
          前往管理页 →
        </Link>
      </Section>
    </div>
  )
}
