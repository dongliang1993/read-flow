import { useState } from 'react'

import { GoogleIcon } from '@/components/icon/google'
import { useAuthStore } from '@/store/auth-store'
import { authClient } from '@/lib/auth-client'
import { QuickLogin } from './quick-login'

export function LoginForm() {
  const { closeAuth, setMode } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => closeAuth(),
        onError: (ctx) => {
          setError(ctx.error.message || '登录失败')
          setIsLoading(false)
        },
      }
    )
  }

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.href,
    })
  }

  const QUICK_LOGIN_CHANNELS = [
    {
      label: 'Google',
      icon: <GoogleIcon />,
      onClick: handleGoogleLogin,
    },
  ]

  return (
    <div className='space-y-6'>
      {error && (
        <div className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className='space-y-4'>
        <div>
          <label
            htmlFor='login-email'
            className='block text-sm font-medium text-neutral-700'
          >
            邮箱
          </label>
          <input
            id='login-email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='off'
            autoCapitalize='off'
            autoCorrect='off'
            autoFocus={false}
            className='mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500'
            placeholder='you@example.com'
          />
        </div>

        <div className='relative'>
          <label
            htmlFor='login-password'
            className='block text-sm font-medium text-neutral-700'
          >
            密码
          </label>
          <input
            id='login-password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500'
            placeholder='••••••••'
          />
          <button
            type='button'
            onClick={() => setMode('forgot-password')}
            className='absolute right-0 top-0 text-sm text-neutral-700 hover:text-neutral-900 cursor-pointer'
          >
            忘记密码？
          </button>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 mt-3'
        >
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>

      <QuickLogin channels={QUICK_LOGIN_CHANNELS} isLoading={isLoading} />
      <p className='text-center text-sm text-neutral-600'>
        还没有账户？
        <button
          type='button'
          onClick={() => setMode('register')}
          className='cursor-pointer font-medium text-neutral-900 underline'
        >
          注册
        </button>
      </p>
    </div>
  )
}
