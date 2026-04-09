import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'SECRETARY' | 'COORDINATOR' | 'DIRECTOR' | 'TEACHER' | 'PARENT'

interface User {
  id: string
  name: string
  email: string
  role: Role
  mustResetPassword?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  completePasswordReset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      completePasswordReset: () => set((state) => ({ 
        user: state.user ? { ...state.user, mustResetPassword: false } : null 
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
