import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import AlbumRow from './components/AlbumRow'
import AlbumDetail from './components/AlbumDetail'
import AdminLogin from './components/AdminLogin'
import AdminPanel from './components/AdminPanel'
import { useAlbums } from './hooks/useAlbums'
import { useAdminAuth } from './hooks/useAdminAuth'

/** 首页 - 相册列表 */
function HomePage() {
  const { albums, loading, error } = useAlbums()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#a3a3a3]">
        加载中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-[#a3a3a3]">{error}</p>
        <p className="mt-2 text-sm text-[#666]">
          请在 picture/ 文件夹中放入图片子文件夹，然后运行 <code className="text-indigo-400">npm run sync</code>
        </p>
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-[#a3a3a3]">暂无相册</p>
        <p className="mt-2 text-sm text-[#666]">
          在 picture/ 目录下创建子文件夹并放入图片，然后运行 npm run sync
        </p>
      </div>
    )
  }

  return (
    <>
      <Hero />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {albums.map((album, index) => (
          <AlbumRow key={album.id} album={album} index={index} />
        ))}
      </section>
    </>
  )
}

/** 相册详情页包装 */
function AlbumPage() {
  const { albums, loading } = useAlbums()
  if (loading) return <div className="py-20 text-center text-[#a3a3a3]">加载中...</div>
  return <AlbumDetail albums={albums} />
}

/** 管理页包装 */
function AdminPage() {
  const { albums, reload } = useAlbums()
  return <AdminPanel albums={albums} onUpdate={reload} />
}

export default function App() {
  const { isAdmin } = useAdminAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAdmin={isAdmin} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/album/:albumId" element={<AlbumPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
