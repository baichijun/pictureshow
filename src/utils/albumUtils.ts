import type { Album, AlbumOverride, GalleryImage, ProcessedAlbum } from '@/types/gallery'

const OVERRIDES_KEY = 'pictureshow-overrides'

/** 从 localStorage 读取管理端覆盖配置 */
export function loadLocalOverrides(): Record<string, AlbumOverride> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { albums?: Record<string, AlbumOverride> }
    return parsed.albums ?? {}
  } catch {
    return {}
  }
}

/** 保存管理端覆盖配置到 localStorage */
export function saveLocalOverrides(albums: Record<string, AlbumOverride>) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify({ albums }, null, 2))
}

/** 合并远程 overrides.json 与本地覆盖 */
export function mergeOverrides(
  remote: Record<string, AlbumOverride>,
  local: Record<string, AlbumOverride>,
): Record<string, AlbumOverride> {
  const merged = { ...remote }
  for (const [id, override] of Object.entries(local)) {
    merged[id] = { ...merged[id], ...override }
  }
  return merged
}

/** 应用覆盖配置，生成最终展示的相册数据 */
export function applyOverrides(
  album: Album,
  override?: AlbumOverride,
): ProcessedAlbum | null {
  if (override?.hidden) return null

  const deleted = new Set(override?.deletedImages ?? [])
  let visibleImages = album.images.filter((img) => !deleted.has(img.fileName))

  if (override?.imageOrder?.length) {
    const orderMap = new Map(override.imageOrder.map((name, i) => [name, i]))
    visibleImages = [...visibleImages].sort((a, b) => {
      const ai = orderMap.get(a.fileName) ?? 999
      const bi = orderMap.get(b.fileName) ?? 999
      return ai - bi
    })
  }

  const displayTitle = override?.displayName ?? album.title

  return {
    ...album,
    displayTitle,
    count: visibleImages.length,
    coverUrl: visibleImages[0]?.thumbUrl ?? album.coverUrl,
    visibleImages,
  }
}

/** 重新排序图片列表 */
export function reorderImages(
  images: GalleryImage[],
  fromIndex: number,
  toIndex: number,
): GalleryImage[] {
  const result = [...images]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result
}

/** 默认管理密码（首次使用请修改 src/config/admin.ts） */
export const DEFAULT_ADMIN_PASSWORD = 'pictureshow'
