import { create } from 'zustand'
import {
  getStoredEmail,
  getCognitoAccessToken,
  clearTokens,
} from '@/lib/auth-tokens'

// Estado de sesión para la UI (navbar). No persiste: la fuente de verdad es el
// accessToken en memoria + la cookie httpOnly del refresh token.
//
// - 'loading': aún no resolvemos si hay sesión (evita parpadeo en el primer render).
// - 'authenticated' / 'unauthenticated': resuelto.

type Status = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: Status
  email: string | null
  // Resuelve la sesión al cargar la app. Si hay email guardado, intenta
  // rehidratar el accessToken vía /api/auth/refresh (la cookie viaja sola).
  init: () => Promise<void>
  // Lo llama el login tras guardar los tokens, para reflejar la sesión al toque.
  setAuthenticated: (email: string) => void
  // Cierra sesión: borra la cookie (endpoint) + limpia el estado en memoria.
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  email: null,

  init: async () => {
    // Ya resuelto en esta sesión de pestaña: no re-disparar refresh en cada
    // navegación cliente (el navbar se monta por página).
    if (get().status !== 'loading') return

    const email = getStoredEmail()
    if (!email) {
      set({ status: 'unauthenticated', email: null })
      return
    }

    // Intenta obtener un accessToken válido (refresca con la cookie si hace
    // falta). Si lo logra, hay sesión; si no, la cookie expiró/no existe.
    const token = await getCognitoAccessToken()
    if (token) {
      set({ status: 'authenticated', email })
    } else {
      set({ status: 'unauthenticated', email: null })
    }
  },

  setAuthenticated: (email) => set({ status: 'authenticated', email }),

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // aunque falle el borrado de cookie, limpiamos el estado local
    }
    clearTokens()
    set({ status: 'unauthenticated', email: null })
  },
}))
