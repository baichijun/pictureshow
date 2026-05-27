import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const SAMPLE_DIR = join(ROOT, 'picture', '示例相册')

const colors = [
  { bg: '#6366f1', text: 'Photo 1' },
  { bg: '#8b5cf6', text: 'Photo 2' },
  { bg: '#ec4899', text: 'Photo 3' },
  { bg: '#f43f5e', text: 'Photo 4' },
]

mkdirSync(SAMPLE_DIR, { recursive: true })

for (let i = 0; i < colors.length; i++) {
  const { bg, text } = colors[i]
  const svg = `
    <svg width="1600" height="1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bg}"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="72" fill="white"
        text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>`

  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer()
  writeFileSync(join(SAMPLE_DIR, `sample-${i + 1}.jpg`), buffer)
  console.log(`Created sample-${i + 1}.jpg`)
}

console.log('Sample images created in picture/示例相册/')
