import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth-store'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { ForgotPasswordForm } from './forgot-password-form'

const titleMap = {
  login: { title: '欢迎回来', description: '登录您的 ReadFlow 账户' },
  register: { title: '创建账户', description: '加入 ReadFlow 开始阅读之旅' },
  'forgot-password': { title: '忘记密码', description: '输入邮箱获取重置链接' },
}

export function AuthDialog() {
  const { isOpen, mode, closeAuth } = useAuthStore()
  const { title, description } = titleMap[mode]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuth()}>
      <DialogContent className='sm:max-w-md bg-shade-01 gap-6'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-neutral-900 mb-1.5'>
            {title}
          </DialogTitle>
          <DialogDescription className='text-sm'>
            {description}
          </DialogDescription>
        </DialogHeader>
        {mode === 'login' && <LoginForm />}
        {mode === 'register' && <RegisterForm />}
        {mode === 'forgot-password' && <ForgotPasswordForm />}
      </DialogContent>
    </Dialog>
  )
}
