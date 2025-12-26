import { create } from 'zustand'

type AuthMode = 'login' | 'register' | 'forgot-password'

type AuthStore = {
  isOpen: boolean
  mode: AuthMode
  openAuth: (mode?: AuthMode) => void
  closeAuth: () => void
  setMode: (mode: AuthMode) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isOpen: false,
  mode: 'login',
  openAuth: (mode = 'login') => set({ isOpen: true, mode }),
  closeAuth: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}))

