import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'

export function LoginPage() {
  const navigate = useNavigate()
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
        onSuccess: () => {
          navigate('/library')
        },
        onError: (ctx) => {
          setError(ctx.error.message || '登录失败')
          setIsLoading(false)
        },
      }
    )
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/library',
    })
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-neutral-50'>
      <div className='w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight text-neutral-900'>
            欢迎回来
          </h1>
          <p className='mt-2 text-sm text-neutral-600'>
            登录您的 ReadFlow 账户
          </p>
        </div>

        {error && (
          <div className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>
            {error}
          </div>
        )}

        <button
          type='button'
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className='flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <svg className='h-5 w-5' viewBox='0 0 24 24'>
            <path
              fill='#4285F4'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='#34A853'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='#FBBC05'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
              fill='#EA4335'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
          </svg>
          使用 Google 登录
        </button>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-neutral-200' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white px-4 text-neutral-500'>或</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-neutral-700'
            >
              邮箱
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500'
              placeholder='you@example.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-neutral-700'
            >
              密码
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500'
              placeholder='••••••••'
            />
          </div>

          <div className='flex items-center justify-end'>
            <Link
              to='/auth/forgot-password'
              className='text-sm text-neutral-600 hover:text-neutral-900'
            >
              忘记密码？
            </Link>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className='text-center text-sm text-neutral-600'>
          还没有账户？{' '}
          <Link
            to='/auth/register'
            className='font-medium text-neutral-900 hover:underline'
          >
            注册
          </Link>
        </p>
      </div>
    </div>
  )
}
