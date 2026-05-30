import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ProcessedAlbum } from '@/types/gallery'
import { assetUrl } from '@/utils/assetUrl'

interface AlbumRowProps {
  album: ProcessedAlbum
  index: number
}

/** 首页相册行 - 每行展示一个图片集 */
export default function AlbumRow({ album, index }: AlbumRowProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="mb-12 last:mb-0"
    >
      <Link
        to={`/album/${album.id}`}
        className="group block overflow-hidden rounded-2xl border border-[#262626] bg-[#111111] transition-colors hover:border-[#404040]"
      >
        {/* 封面图 */}
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/7]">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
              <span className="text-5xl opacity-30">{album.displayTitle.charAt(0)}</span>
            </div>
          ) : (
            <img
              src={assetUrl(album.coverUrl)}
              alt={album.displayTitle}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              {album.displayTitle}
              <span className="ml-2 text-lg font-normal text-[#a3a3a3]">
                ({album.count})
              </span>
            </h2>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
