export interface GalleryImage {
  id: string
  fileName: string
  thumbUrl: string
  originalUrl: string
}

export interface Album {
  id: string
  folderName: string
  title: string
  count: number
  coverUrl: string
  images: GalleryImage[]
  updatedAt: string
}

export interface AlbumsData {
  albums: Album[]
  syncedAt: string
}

export interface AlbumOverride {
  displayName?: string
  hidden?: boolean
  imageOrder?: string[]
  deletedImages?: string[]
}

export interface OverridesData {
  albums: Record<string, AlbumOverride>
}

export interface ProcessedAlbum extends Album {
  displayTitle: string
  visibleImages: GalleryImage[]
}
