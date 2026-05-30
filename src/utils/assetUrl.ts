/** 拼接 Vite base 路径，兼容 GitHub Pages 子目录部署。
 *  对路径分段进行 URL 编码，确保中文字符在手机浏览器上也能正确加载。 */
export function assetUrl(path: string): string {
  if (path.startsWith('http')) return path
  const normalized = path.startsWith('/') ? path.slice(1) : path
  // 分段编码：只编码各路径片段中的非 ASCII / 特殊字符，保留斜杠分隔符
  const encoded = normalized
    .split('/')
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/')
  return `${import.meta.env.BASE_URL}${encoded}`
}

/** 拼接 public 目录下的 JSON 数据路径 */
export function dataUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}data/${filename}`
}
