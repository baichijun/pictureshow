import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import type { AlbumOverride, ProcessedAlbum } from '@/types/gallery'
import { loadLocalOverrides, reorderImages, saveLocalOverrides } from '@/utils/albumUtils'
import { assetUrl } from '@/utils/assetUrl'

interface AdminPanelProps {
  albums: ProcessedAlbum[]
  onUpdate: () => void
}

/** 管理面板 - 重命名、删除、排序 */
export default function AdminPanel({ albums, onUpdate }: AdminPanelProps) {
  const { isAdmin, logout } = useAdminAuth()
  const [overrides, setOverrides] = useState(loadLocalOverrides)
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.id ?? '')
  const [saved, setSaved] = useState(false)

  if (!isAdmin) return <Navigate to="/admin/login" replace />

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId)
  const albumOverride = overrides[selectedAlbumId] ?? {}

  const updateOverride = (patch: Partial<AlbumOverride>) => {
    setOverrides((prev) => ({
      ...prev,
      [selectedAlbumId]: { ...prev[selectedAlbumId], ...patch },
    }))
    setSaved(false)
  }

  const handleSave = () => {
    saveLocalOverrides(overrides)
    setSaved(true)
    onUpdate()
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDeleteImage = (fileName: string) => {
    const deleted = new Set(albumOverride.deletedImages ?? [])
    deleted.add(fileName)
    updateOverride({ deletedImages: [...deleted] })
  }

  const handleMoveImage = (from: number, to: number) => {
    if (!selectedAlbum) return
    const reordered = reorderImages(selectedAlbum.visibleImages, from, to)
    updateOverride({ imageOrder: reordered.map((img) => img.fileName) })
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ albums: overrides }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'overrides.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">相册管理</h1>
        <button
          onClick={logout}
          className="rounded-lg border border-[#262626] px-4 py-2 text-sm text-[#a3a3a3] hover:text-white"
        >
          退出登录
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* 相册列表 */}
        <aside className="space-y-2">
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                selectedAlbumId === album.id
                  ? 'bg-indigo-600/20 text-white'
                  : 'text-[#a3a3a3] hover:bg-[#111111] hover:text-white'
              }`}
            >
              {album.displayTitle} ({album.count})
            </button>
          ))}
        </aside>

        {/* 编辑区 */}
        {selectedAlbum && (
          <motion.div
            key={selectedAlbumId}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-[#262626] bg-[#111111] p-6"
          >
            <div className="mb-6">
              <label className="mb-2 block text-sm text-[#a3a3a3]">显示名称</label>
              <input
                type="text"
                value={albumOverride.displayName ?? selectedAlbum.folderName}
                onChange={(e) => updateOverride({ displayName: e.target.value })}
                className="w-full rounded-lg border border-[#262626] bg-black px-4 py-2 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="mb-6 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={albumOverride.hidden ?? false}
                  onChange={(e) => updateOverride({ hidden: e.target.checked })}
                  className="rounded"
                />
                隐藏此相册
              </label>
            </div>

            <h3 className="mb-4 text-sm font-medium text-[#a3a3a3]">图片排序与管理</h3>
            <div className="space-y-2">
              {selectedAlbum.visibleImages.map((img, index) => (
                <div
                  key={img.id}
                  className="flex items-center gap-3 rounded-lg border border-[#262626] bg-black p-2"
                >
                  <img src={assetUrl(img.thumbUrl)} alt="" className="h-12 w-16 rounded object-cover" />
                  <span className="flex-1 truncate text-sm">{img.fileName}</span>
                  <div className="flex gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveImage(index, index - 1)}
                      className="rounded px-2 py-1 text-xs text-[#a3a3a3] hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      disabled={index === selectedAlbum.visibleImages.length - 1}
                      onClick={() => handleMoveImage(index, index + 1)}
                      className="rounded px-2 py-1 text-xs text-[#a3a3a3] hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleDeleteImage(img.fileName)}
                      className="rounded px-2 py-1 text-xs text-red-400 hover:text-red-300"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleSave} className="gradient-btn rounded-lg px-6 py-2 text-sm font-medium text-white">
                {saved ? '已保存 ✓' : '保存更改'}
              </button>
              <button
                onClick={handleExport}
                className="rounded-lg border border-[#262626] px-6 py-2 text-sm text-[#a3a3a3] hover:text-white"
              >
                导出配置
              </button>
            </div>
            <p className="mt-4 text-xs text-[#a3a3a3]">
              管理配置保存在浏览器本地。导出后可放入 public/data/overrides.json 并重新部署以持久化。
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
