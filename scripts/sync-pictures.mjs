import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, relative, resolve } from 'node:path'
import sharp from 'sharp'
import chokidar from 'chokidar'

const ROOT = resolve(import.meta.dirname, '..')
const PICTURE_DIR = join(ROOT, 'picture')
const PUBLIC_GALLERY = join(ROOT, 'public', 'gallery')
const DATA_DIR = join(ROOT, 'public', 'data')
const ALBUMS_JSON = join(DATA_DIR, 'albums.json')
const SYNC_STATE_FILE = join(ROOT, '.sync-state.json')
const OVERRIDES_FILE = join(DATA_DIR, 'overrides.json')

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.avif',
])

const THUMB_WIDTH = 1024
const THUMB_HEIGHT = 768

/** @typedef {{ hash: string; syncedAt: string }} SyncEntry */
/** @typedef {Record<string, Record<string, SyncEntry>>} SyncState */

function loadSyncState() {
  if (!existsSync(SYNC_STATE_FILE)) return {}
  return JSON.parse(readFileSync(SYNC_STATE_FILE, 'utf-8'))
}

function saveSyncState(state) {
  writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

function fileHash(filePath) {
  const buffer = readFileSync(filePath)
  return createHash('md5').update(buffer).digest('hex')
}

function isImageFile(name) {
  return IMAGE_EXTENSIONS.has(extname(name).toLowerCase())
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'album'
}

function ensureDirs() {
  mkdirSync(PICTURE_DIR, { recursive: true })
  mkdirSync(PUBLIC_GALLERY, { recursive: true })
  mkdirSync(DATA_DIR, { recursive: true })

  if (!existsSync(OVERRIDES_FILE)) {
    writeFileSync(OVERRIDES_FILE, JSON.stringify({ albums: {} }, null, 2), 'utf-8')
  }
}

async function processImage(albumId, fileName, sourcePath, syncState) {
  const hash = fileHash(sourcePath)
  const prev = syncState[albumId]?.[fileName]

  // 仅处理新增或变更的文件
  if (prev?.hash === hash) return false

  const albumDir = join(PUBLIC_GALLERY, albumId)
  const thumbDir = join(albumDir, 'thumb')
  const origDir = join(albumDir, 'orig')
  mkdirSync(thumbDir, { recursive: true })
  mkdirSync(origDir, { recursive: true })

  const thumbPath = join(thumbDir, fileName)
  const origPath = join(origDir, fileName)

  // 生成 1024x768 浏览版缩略图
  await sharp(sourcePath)
    .rotate()
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(thumbPath.replace(/\.[^.]+$/, '.jpg'))

  // 保存原图副本
  const origBuffer = readFileSync(sourcePath)
  writeFileSync(origPath, origBuffer)

  if (!syncState[albumId]) syncState[albumId] = {}
  syncState[albumId][fileName] = {
    hash,
    syncedAt: new Date().toISOString(),
  }

  console.log(`  ✓ 已同步: ${albumId}/${fileName}`)
  return true
}

async function syncPictures() {
  ensureDirs()
  const syncState = loadSyncState()
  const albums = []

  const entries = readdirSync(PICTURE_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))

  for (const entry of entries) {
    const albumName = entry.name
    const albumId = slugify(albumName)
    const albumPath = join(PICTURE_DIR, albumName)

    const imageFiles = readdirSync(albumPath)
      .filter((f) => isImageFile(f))
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))

    if (imageFiles.length === 0) continue

    let updated = 0
    for (const fileName of imageFiles) {
      const changed = await processImage(
        albumId,
        fileName,
        join(albumPath, fileName),
        syncState,
      )
      if (changed) updated++
    }

    // 构建相册数据（包含已同步但源文件已删除的图片）
    const syncedFiles = syncState[albumId] ? Object.keys(syncState[albumId]) : []
    const allImages = [...new Set([...imageFiles, ...syncedFiles])].sort((a, b) =>
      a.localeCompare(b, 'zh-CN'),
    )

    const images = allImages
      .filter((fileName) => {
        const thumbJpg = join(PUBLIC_GALLERY, albumId, 'thumb', fileName.replace(/\.[^.]+$/, '.jpg'))
        return existsSync(thumbJpg) || existsSync(join(PUBLIC_GALLERY, albumId, 'thumb', fileName))
      })
      .map((fileName, index) => ({
        id: `${albumId}-${index}-${basename(fileName, extname(fileName))}`,
        fileName,
        thumbUrl: `/gallery/${albumId}/thumb/${fileName.replace(/\.[^.]+$/, '.jpg')}`,
        originalUrl: `/gallery/${albumId}/orig/${fileName}`,
      }))

    if (images.length === 0) continue

    albums.push({
      id: albumId,
      folderName: albumName,
      title: albumName,
      count: images.length,
      coverUrl: images[0].thumbUrl,
      images,
      updatedAt: new Date().toISOString(),
    })

    console.log(`相册 "${albumName}": ${images.length} 张图片${updated ? ` (${updated} 张更新)` : ''}`)
  }

  albums.sort((a, b) => a.folderName.localeCompare(b.folderName, 'zh-CN'))

  writeFileSync(ALBUMS_JSON, JSON.stringify({ albums, syncedAt: new Date().toISOString() }, null, 2), 'utf-8')
  saveSyncState(syncState)

  console.log(`\n同步完成，共 ${albums.length} 个相册 → ${relative(ROOT, ALBUMS_JSON)}`)
}

function watchPictures() {
  console.log(`监听目录: ${PICTURE_DIR}`)
  const watcher = chokidar.watch(PICTURE_DIR, {
    ignored: /(^|[/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 800, pollInterval: 100 },
  })

  let timer
  const debouncedSync = () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      console.log('\n检测到变更，开始同步...')
      await syncPictures()
    }, 1000)
  }

  watcher.on('add', debouncedSync)
  watcher.on('change', debouncedSync)
  watcher.on('unlink', debouncedSync)
  watcher.on('addDir', debouncedSync)
}

const isWatch = process.argv.includes('--watch')

await syncPictures()
if (isWatch) watchPictures()
