import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface HeaderProps {
  isAdmin?: boolean
}

/** 齿轮/设置图标（内联 SVG，无需额外依赖） */
function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

/** 顶部导航栏 */
export default function Header({ isAdmin = false }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 border-b border-[#262626] bg-black/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">
          <span className="gradient-text">Picture Show</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-[#a3a3a3]">
          <Link to="/" className="transition-colors hover:text-white">
            相册
          </Link>
          {/* 齿轮/设置图标，替代原“登录”文字，仍触发原登录/管理跳转 */}
          <Link
            to={isAdmin ? '/admin' : '/admin/login'}
            aria-label={isAdmin ? '管理' : '登录'}
            title={isAdmin ? '管理' : '登录'}
            className="flex items-center transition-colors hover:text-white"
          >
            <GearIcon className="h-5 w-5" />
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}
