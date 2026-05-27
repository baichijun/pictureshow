import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface HeaderProps {
  isAdmin?: boolean
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
          <Link
            to={isAdmin ? '/admin' : '/admin/login'}
            className="transition-colors hover:text-white"
          >
            {isAdmin ? '管理' : '登录'}
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}
