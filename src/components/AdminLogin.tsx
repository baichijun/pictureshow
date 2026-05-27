import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdminAuth } from '@/hooks/useAdminAuth'

/** 管理端登录页 */
export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isAdmin } = useAdminAuth()
  const navigate = useNavigate()

  if (isAdmin) return <Navigate to="/admin" replace />

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(password)) {
      navigate('/admin')
    } else {
      setError('密码错误')
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl border border-[#262626] bg-[#111111] p-8"
      >
        <h1 className="mb-6 text-2xl font-bold">管理登录</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-[#a3a3a3]">
              管理密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className="w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-white outline-none focus:border-indigo-500"
              placeholder="请输入密码"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="gradient-btn w-full rounded-lg py-3 font-medium text-white">
            登录
          </button>
        </form>
        <Link to="/" className="mt-4 block text-center text-sm text-[#a3a3a3] hover:text-white">
          返回首页
        </Link>
      </motion.div>
    </div>
  )
}
