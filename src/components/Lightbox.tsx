import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GalleryImage } from '@/types/gallery'

interface LightboxProps {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onChange: (index: number) => void
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
}

/** 灯箱组件 - 支持上下张切换与过渡特效 */
export default function Lightbox({ images, currentIndex, onClose, onChange }: LightboxProps) {
  const [direction, setDirection] = useState(0)
  const image = images[currentIndex]

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      onChange(currentIndex - 1)
    }
  }

  const goNext = () => {
    if (currentIndex < images.length - 1) {
      setDirection(1)
      onChange(currentIndex + 1)
    }
  }

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

      <div className="flex max-h-[90vh] max-w-[95vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={image.id}
            src={image.originalUrl}
            alt={image.fileName}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-[#a3a3a3]">
        {image.fileName}
      </div>
    </motion.div>
  )
}
