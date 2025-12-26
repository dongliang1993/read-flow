import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'

export function ForgotPasswordPage() {
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
          setError(ctx.error.message || '发送失败，请稍后重试')
          setIsLoading(false)
        },
      }
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">邮件已发送</h1>
            <p className="mt-2 text-sm text-neutral-600">
              我们已向 <span className="font-medium">{email}</span>{' '}
              发送了密码重置链接。请检查您的收件箱。
            </p>
          </div>
          <Link
            to="/auth/login"
            className="block w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            返回登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            忘记密码
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            输入您的邮箱，我们将发送密码重置链接
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700"
            >
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? '发送中...' : '发送重置链接'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-600">
          想起密码了？{' '}
          <Link
            to="/auth/login"
            className="font-medium text-neutral-900 hover:underline"
          >
            返回登录
          </Link>
        </p>
      </div>
    </div>
  )
}

