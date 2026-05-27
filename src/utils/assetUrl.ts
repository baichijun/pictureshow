/** 拼接 Vite base 路径，兼容 GitHub Pages 子目录部署 */
export function assetUrl(path: string): string {
  if (path.startsWith('http')) return path
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}

/** 拼接 public 目录下的 JSON 数据路径 */
export function dataUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}data/${filename}`
}
