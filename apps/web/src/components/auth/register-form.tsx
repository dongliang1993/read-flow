import { useState } from 'react'
import { QuickLogin } from './quick-login'
import { useAuthStore } from '@/store/auth-store'
import { authClient } from '@/lib/auth-client'
import { GoogleIcon } from '@/components/icon/google'

export function RegisterForm() {
  const { closeAuth, setMode } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    await authClient.signUp.email(
      { name, email, password },
      {
        onSuccess: () => closeAuth(),
        onError: (ctx) => {
          setError(ctx.error.message || '注册失败')
          setIsLoading(false)
        },
      }
    )
  }

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.pathname,
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

      <form onSubmit={handleRegister} className='space-y-4'>
        <div>
          <label
            htmlFor='register-name'
            className='block text-sm font-medium text-neutral-700'
          >
            用户名
          </label>
          <input
            id='register-name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className='mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500'
            placeholder='您的用户名'
          />
        </div>

        <div>
          <label
            htmlFor='register-email'
            className='block text-sm font-medium text-neutral-700'
          >
            邮箱
          </label>
          <input
            id='register-email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500'
            placeholder='you@example.com'
          />
        </div>

        <div>
          <label
            htmlFor='register-password'
            className='block text-sm font-medium text-neutral-700'
          >
            密码
          </label>
          <input
            id='register-password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className='mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500'
            placeholder='至少 8 个字符'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full rounded-lg bg-neutral-900 px-4 py-2.5  text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50  mt-3'
        >
          {isLoading ? '注册中...' : '注册'}
        </button>
      </form>
      <QuickLogin channels={QUICK_LOGIN_CHANNELS} isLoading={isLoading} />
      <p className='text-center text-sm text-neutral-600'>
        已有账户？{' '}
        <button
          type='button'
          onClick={() => setMode('login')}
          className='font-medium text-neutral-900 hover:underline'
        >
          登录
        </button>
      </p>
    </div>
  )
}
