import { createAuthClient } from 'better-auth/react'
import { useCallback, useMemo } from 'react'
import { useAuthStore } from '@/store/auth-store'

import { env } from '@/config/env'

export const authClient = createAuthClient({
  baseURL: `${env.apiBaseUrl}`,
})

export const { useSession, signIn, signUp, signOut } = authClient

export const useAuth = () => {
  const openAuth = useAuthStore((state) => state.openAuth)
  const session = useSession()

  const isLogin = useMemo(() => {
    return session?.data !== null
  }, [session])

  const assertLogin = useCallback(() => {
    if (!isLogin) {
      openAuth('login')
      return false
    }

    return true
  }, [isLogin, openAuth])

  return { assertLogin }
}
