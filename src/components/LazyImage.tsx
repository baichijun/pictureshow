import { useState } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  /** 应用在 <img> 上的类名（如 object-cover、group-hover 动效等） */
  className?: string
  /** 加载失败时展示的占位字符（通常为标题首字） */
  fallbackChar?: string
  /** 占位字符的字号等样式 */
  fallbackClassName?: string
}

/**
 * 懒加载图片组件（可复用）：
 * - 原生懒加载 loading="lazy"，仅在进入视口附近才请求
 * - decoding="async" 异步解码，避免阻塞主线程
 * - 加载完成前显示骨架占位，加载后淡入，避免布局抖动
 * - 加载失败时回退为渐变色 + 首字占位
 * 注意：父容器需为 relative 定位，骨架占位使用绝对定位铺满。
 */
export default function LazyImage({
  src,
  alt,
  className = '',
  fallbackChar,
  fallbackClassName = '',
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
        <span className={`opacity-30 ${fallbackClassName}`}>{fallbackChar}</span>
      </div>
    )
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#161616] to-[#0d0d0d]" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  )
}
