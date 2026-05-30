import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Lightbox from './Lightbox'
import type { ProcessedAlbum } from '@/types/gallery'
import { assetUrl } from '@/utils/assetUrl'

interface AlbumDetailProps {
  albums: ProcessedAlbum[]
}

/** 相册详情页 - 网格展示缩略图 */
export default function AlbumDetail({ albums }: AlbumDetailProps) {
  const { albumId } = useParams<{ albumId: string }>()
  const album = albums.find((a) => a.id === albumId)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [erroredImages, setErroredImages] = useState<Set<string>>(new Set())

  const handleImageError = useCallback((imageId: string) => {
    setErroredImages((prev) => new Set(prev).add(imageId))
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null || !album) return
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => Math.min((i ?? 0) + 1, album.visibleImages.length - 1))
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => Math.max((i ?? 0) - 1, 0))
      } else if (e.key === 'Escape') {
        setLightboxIndex(null)
      }
    },
    [lightboxIndex, album],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!album) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-[#a3a3a3]">未找到该相册</p>
        <Link to="/" className="mt-4 inline-block text-indigo-400 hover:underline">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/" className="mb-6 inline-flex items-center text-sm text-[#a3a3a3] hover:text-white">
          ← 返回相册列表
        </Link>
        <h1 className="mb-8 text-3xl font-bold">
          {album.displayTitle}
          <span className="ml-2 text-xl font-normal text-[#a3a3a3]">({album.count})</span>
        </h1>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {album.visibleImages.map((image, index) => (
          <motion.button
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#262626] bg-[#111111] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
          {erroredImages.has(image.id) ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
              <span className="text-2xl opacity-20">{image.fileName.charAt(0)}</span>
            </div>
          ) : (
            <img
              src={assetUrl(image.thumbUrl)}
              alt={image.fileName}
              loading="lazy"
              onError={() => handleImageError(image.id)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          </motion.button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={album.visibleImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </div>
  )
}
