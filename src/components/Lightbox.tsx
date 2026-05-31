import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GalleryImage } from '@/types/gallery'
import { assetUrl } from '@/utils/assetUrl'

interface LightboxProps {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onChange: (index: number) => void
}

/** 缩放范围：最小 25%，最大 3000% */
const MIN_SCALE = 0.25
const MAX_SCALE = 30
/** 滚轮每格缩放系数 */
const WHEEL_STEP = 1.0015

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/** 灯箱组件 - 支持上下张切换、滚轮/双指缩放（25%~3000%）与拖拽平移 */
export default function Lightbox({ images, currentIndex, onClose, onChange }: LightboxProps) {
  const [direction, setDirection] = useState(0)
  // 缩放与平移状态（transform: translate 后 scale）
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const image = images[currentIndex]

  // 容器引用，用于计算光标相对中心的偏移，实现“以光标为中心”缩放
  const viewportRef = useRef<HTMLDivElement>(null)
  // 鼠标拖拽状态
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false, startX: 0, startY: 0, baseX: 0, baseY: 0,
  })
  // 触摸手势状态（单指平移 / 双指缩放）
  const touchRef = useRef<{
    mode: 'none' | 'pan' | 'pinch'
    startX: number; startY: number; baseX: number; baseY: number
    startDist: number; startScale: number
    centerX: number; centerY: number
  }>({ mode: 'none', startX: 0, startY: 0, baseX: 0, baseY: 0, startDist: 0, startScale: 1, centerX: 0, centerY: 0 })

  /** 重置缩放与位移 */
  const resetTransform = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1)
      resetTransform()
      onChange(currentIndex - 1)
    }
  }, [currentIndex, onChange, resetTransform])

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setDirection(1)
      resetTransform()
      onChange(currentIndex + 1)
    }
  }, [currentIndex, images.length, onChange, resetTransform])

  // 切换图片时重置缩放
  useEffect(() => {
    resetTransform()
  }, [currentIndex, resetTransform])

  /** 以某个屏幕坐标点为锚点，按目标缩放值进行缩放（解析锚点用 prev → next 比例修正位移） */
  const applyZoom = useCallback((clientX: number, clientY: number, resolveNext: (prev: number) => number) => {
    const vp = viewportRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setScale((prevScale) => {
      const nextScale = clamp(resolveNext(prevScale), MIN_SCALE, MAX_SCALE)
      if (nextScale === prevScale) return prevScale
      const ratio = nextScale / prevScale
      setOffset((prevOffset) => {
        const dx = clientX - cx - prevOffset.x
        const dy = clientY - cy - prevOffset.y
        return {
          x: prevOffset.x - dx * (ratio - 1),
          y: prevOffset.y - dy * (ratio - 1),
        }
      })
      return nextScale
    })
  }, [])

  /** 缩放到指定绝对值（按钮 / 双击 / 捏合用） */
  const zoomAt = useCallback((clientX: number, clientY: number, targetScale: number) => {
    applyZoom(clientX, clientY, () => targetScale)
  }, [applyZoom])

  /** 鼠标滚轮缩放（以倍率方式，避免读取过期 scale）。
   *  以原生非被动监听挂载，否则 React 的被动监听会令 preventDefault 失效。 */
  const handleWheelNative = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const factor = Math.pow(WHEEL_STEP, -e.deltaY)
    applyZoom(e.clientX, e.clientY, (prev) => prev * factor)
  }, [applyZoom])

  /** 双击：在 1x 与 2x 之间切换 */
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (scale > 1) {
      resetTransform()
    } else {
      zoomAt(e.clientX, e.clientY, 2)
    }
  }, [scale, zoomAt, resetTransform])

  // ---- 鼠标拖拽平移 ----
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return
    e.preventDefault()
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    }
  }, [scale, offset])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      setOffset({
        x: dragRef.current.baseX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.baseY + (e.clientY - dragRef.current.startY),
      })
    }
    const onUp = () => { dragRef.current.active = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ---- 触摸手势（单指平移 / 双指捏合缩放）----
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [t1, t2] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      touchRef.current = {
        ...touchRef.current,
        mode: 'pinch',
        startDist: dist,
        startScale: scale,
        centerX: (t1.clientX + t2.clientX) / 2,
        centerY: (t1.clientY + t2.clientY) / 2,
      }
    } else if (e.touches.length === 1 && scale > 1) {
      const t = e.touches[0]
      touchRef.current = {
        ...touchRef.current,
        mode: 'pan',
        startX: t.clientX,
        startY: t.clientY,
        baseX: offset.x,
        baseY: offset.y,
      }
    } else {
      touchRef.current.mode = 'none'
    }
  }, [scale, offset])

  /** 触摸移动（原生非被动监听，便于 preventDefault 阻止页面滚动 / 系统缩放） */
  const handleTouchMoveNative = useCallback((e: TouchEvent) => {
    const state = touchRef.current
    if (state.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault()
      const [t1, t2] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      if (state.startDist > 0) {
        zoomAt(state.centerX, state.centerY, state.startScale * (dist / state.startDist))
      }
    } else if (state.mode === 'pan' && e.touches.length === 1) {
      e.preventDefault()
      const t = e.touches[0]
      setOffset({
        x: state.baseX + (t.clientX - state.startX),
        y: state.baseY + (t.clientY - state.startY),
      })
    }
  }, [zoomAt])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) touchRef.current.mode = 'none'
  }, [])

  // 以非被动方式挂载 wheel / touchmove，确保 preventDefault 生效
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    vp.addEventListener('wheel', handleWheelNative, { passive: false })
    vp.addEventListener('touchmove', handleTouchMoveNative, { passive: false })
    return () => {
      vp.removeEventListener('wheel', handleWheelNative)
      vp.removeEventListener('touchmove', handleTouchMoveNative)
    }
  }, [handleWheelNative, handleTouchMoveNative])

  const zoomPercent = Math.round(scale * 100)
  const isZoomed = scale !== 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="关闭"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute left-4 top-4 text-sm text-[#a3a3a3]">
        {currentIndex + 1} / {images.length}
      </div>

      {/* 缩放控制条 */}
      <div
        className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/10 px-1 py-1 text-white backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, scale / 1.5)}
          className="rounded-full px-2 py-1 text-lg leading-none transition-colors hover:bg-white/20"
          aria-label="缩小"
        >
          −
        </button>
        <span className="min-w-[3.5rem] text-center text-xs tabular-nums">{zoomPercent}%</span>
        <button
          onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, scale * 1.5)}
          className="rounded-full px-2 py-1 text-lg leading-none transition-colors hover:bg-white/20"
          aria-label="放大"
        >
          +
        </button>
        {isZoomed && (
          <button
            onClick={resetTransform}
            className="ml-1 rounded-full px-2 py-1 text-xs transition-colors hover:bg-white/20"
            aria-label="重置缩放"
          >
            重置
          </button>
        )}
      </div>

      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:left-4"
          aria-label="上一张"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div
        ref={viewportRef}
        className="flex h-[90vh] w-[95vw] touch-none items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isZoomed ? (dragRef.current.active ? 'grabbing' : 'grab') : 'auto' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={image.id}
            src={assetUrl(image.originalUrl)}
            alt={image.fileName}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            draggable={false}
            className="max-h-[90vh] max-w-full select-none rounded-lg object-contain shadow-2xl"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              // 缩放/平移时关闭过渡以保证跟手；仅在重置到 1x 时平滑回弹
              transition: dragRef.current.active || touchRef.current.mode !== 'none'
                ? 'none'
                : 'transform 0.15s ease-out',
            }}
          />
        </AnimatePresence>
      </div>

      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-4"
          aria-label="下一张"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 text-center text-sm text-[#a3a3a3]">
        {image.fileName}
        <span className="ml-2 hidden text-xs text-[#666] sm:inline">滚轮缩放 · 双击放大 · 拖拽平移</span>
      </div>
    </motion.div>
  )
}
