import { useCallback, useState } from 'react'
import { ADMIN_PASSWORD } from '@/config/admin'

const AUTH_KEY = 'pictureshow-admin-auth'

/** 管理端身份验证 Hook */
export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'true')

  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setIsAdmin(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY)
    setIsAdmin(false)
  }, [])

  return { isAdmin, login, logout }
}
