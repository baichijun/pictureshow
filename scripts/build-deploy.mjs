import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const DIST = join(ROOT, 'dist')
const TARGETS = JSON.parse(readFileSync(join(ROOT, 'deploy', 'targets.json'), 'utf-8'))

const target = process.argv[2] ?? 'github'

if (!TARGETS[target]) {
  console.error(`未知部署目标: ${target}`)
  console.error(`可用目标: ${Object.keys(TARGETS).join(', ')}`)
  process.exit(1)
}

const { domain, platform } = TARGETS[target]
const cnameSrc = join(ROOT, 'deploy', target, 'CNAME')

console.log(`\n构建部署包 → ${platform}`)
console.log(`域名: ${domain}\n`)

// 1. Vite 构建（base 始终为 /，适配自定义域名根路径）
const build = spawnSync('npm', ['run', 'build:vite'], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
})

if (build.status !== 0) process.exit(build.status ?? 1)

// 2. 写入目标域名 CNAME
if (!existsSync(cnameSrc)) {
  console.error(`缺少 CNAME 文件: ${cnameSrc}`)
  process.exit(1)
}
copyFileSync(cnameSrc, join(DIST, 'CNAME'))
console.log(`✓ CNAME → ${domain}`)

// 3. SPA 路由回退（GitHub Pages / EdgeOne 静态托管均适用）
const indexHtml = join(DIST, 'index.html')
const fallback404 = join(DIST, '404.html')
copyFileSync(indexHtml, fallback404)
console.log('✓ 404.html（SPA 回退）')

// 4. 从 desktop-sync 刷新桌面同步工具到 downloads/（保证下载到最新版本）
const downloadsDir = join(DIST, 'downloads')
mkdirSync(downloadsDir, { recursive: true })
const syncDir = join(ROOT, 'desktop-sync')
const downloadFiles = [
  ['pictureshow同步.py', 'pictureshow同步.py'],
  ['build-exe.bat', 'build-exe.bat'],
  ['README.md', '使用说明.md'],
]
for (const [src, dest] of downloadFiles) {
  const srcPath = join(syncDir, src)
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, join(downloadsDir, dest))
  }
}
console.log('✓ downloads/（桌面同步工具）')

// 5. 写入部署元信息，便于排查
mkdirSync(join(DIST, 'data'), { recursive: true })
writeFileSync(
  join(DIST, 'data', 'deploy-info.json'),
  JSON.stringify({ target, domain, platform, builtAt: new Date().toISOString() }, null, 2),
  'utf-8',
)
console.log('✓ deploy-info.json')

console.log(`\n构建完成: dist/ → ${domain}`)
