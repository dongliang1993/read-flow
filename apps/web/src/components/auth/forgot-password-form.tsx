import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { authClient } from '@/lib/auth-client'

export function ForgotPasswordForm() {
  const { setMode } = useAuthStore()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    await authClient.forgetPassword(
      { email, redirectTo: '/auth/reset-password' },
      {
        onSuccess: () => {
          setSuccess(true)
          setIsLoading(false)
        },
        onError: (ctx) => {
          setError(ctx.error.message || '发送失败')
          setIsLoading(false)
        },
      }
    )
  }

  if (success) {
    return (
      <div className='space-y-4 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
          <svg
            className='h-6 w-6 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <p className='text-sm text-neutral-600'>
          重置链接已发送到 <span className='font-medium'>{email}</span>
        </p>
        <button
          type='button'
          onClick={() => setMode('login')}
          className='text-sm font-medium text-neutral-900 hover:underline'
        >
          返回登录
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {error && (
        <div className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='forgot-email'
            className='block text-sm font-medium text-neutral-700'
          >
            邮箱
          </label>
          <input
            id='forgot-email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500'
            placeholder='you@example.com'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50'
        >
          {isLoading ? '发送中...' : '发送重置链接'}
        </button>
      </form>

      <p className='text-center text-sm text-neutral-600'>
        <button
          type='button'
          onClick={() => setMode('login')}
          className='font-medium text-neutral-900 hover:underline'
        >
          返回登录
        </button>
      </p>
    </div>
  )
}
