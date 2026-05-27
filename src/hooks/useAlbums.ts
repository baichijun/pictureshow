import { useCallback, useEffect, useState } from 'react'
import type { AlbumsData, OverridesData, ProcessedAlbum } from '@/types/gallery'
import { applyOverrides, loadLocalOverrides, mergeOverrides } from '@/utils/albumUtils'
import { dataUrl } from '@/utils/assetUrl'

/** 加载并处理相册数据 */
export function useAlbums() {
  const [albums, setAlbums] = useState<ProcessedAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [albumsRes, overridesRes] = await Promise.all([
        fetch(dataUrl('albums.json')),
        fetch(dataUrl('overrides.json')),
      ])

      if (!albumsRes.ok) throw new Error('无法加载相册数据，请先运行 npm run sync')

      const albumsData: AlbumsData = await albumsRes.json()
      let remoteOverrides = {}
      if (overridesRes.ok) {
        const overridesData: OverridesData = await overridesRes.json()
        remoteOverrides = overridesData.albums ?? {}
      }

      const localOverrides = loadLocalOverrides()
      const merged = mergeOverrides(remoteOverrides, localOverrides)

      const processed = albumsData.albums
        .map((album) => applyOverrides(album, merged[album.id]))
        .filter((a): a is ProcessedAlbum => a !== null)

      setAlbums(processed)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { albums, loading, error, reload: load }
}
