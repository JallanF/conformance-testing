// =============================================================================
// WHAT: Authentication context provider
// ROLE: Owns and provides Application State for the currently authenticated
//       user. Wraps the Router so any page orchestration hook can access the
//       current user via useAuth().
//
// ARCHITECTURE NOTE (cc27 / State Management / Application State):
//   AuthContext is Application State — one of three state categories:
//     1. Server State      → TanStack Query (order data, warehouse data, etc.)
//     2. Component State   → React Hook Form (form fields inside sections)
//     3. Application State → React Context (current user, role, permissions)
//
//   CRITICAL: Business Components (sections) NEVER read AuthContext directly.
//   Only page orchestration hooks read it. They derive props (e.g. canViewCost,
//   showApprovalSection) and pass them down to Business Components. This keeps
//   Business Components fully encapsulated and testable in isolation.
//
// SECURITY — THE SERVER-STATE CACHE IS CLEARED ON LOGIN AND LOGOUT:
//   TanStack Query caches server responses in memory. Cached data can include
//   role-restricted fields (e.g. financials), so one user's cached data must
//   never survive into another user's session on the same browser tab.
//   queryClient.clear() is therefore called in BOTH login() and logout():
//     logout() — the departing user's data must not linger for the next user
//     login()  — belt and braces: every authenticated session starts with an
//                empty cache, however it began (e.g. re-login after a session
//                expiry, where logout() never ran)
//   This is why AuthProvider sits INSIDE QueryProvider (see App.tsx) — it
//   needs access to the query client.
//
// SEE ALSO:
//   shared/utility-hooks/useAuth.ts — thin hook for consuming this context
//   app/tokenStore.ts               — receives the token on login/logout
//   app/App.tsx                     — the provider order
// =============================================================================

import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setToken, clearToken } from './tokenStore'
import { registerSessionExpiredHandler } from './sessionExpiry'
import { showErrorToast } from './Notifications'
import type { AuthUser } from '@/shared/contracts/authContracts'

// The shape of the value provided to all consumers.
export interface AuthContextValue {
  // The currently authenticated user, or null if not logged in.
  user: AuthUser | null

  // Called by the login page on successful authentication.
  // Stores the user in context and the token in the token store.
  login: (user: AuthUser, token: string) => void

  // Called by the nav bar logout button.
  // Clears the user from context and the token from the token store.
  logout: () => void
}

// PATTERN: React Context for Application State
// Created here, consumed via useAuth() — never used directly in components.
export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)

  // The TanStack Query client — available because QueryProvider wraps this
  // provider (see App.tsx). Used to clear cached server state below.
  const queryClient = useQueryClient()

  const login = useCallback((authUser: AuthUser, token: string) => {
    // SECURITY: start the new session with an empty server-state cache
    // (see header comment).
    queryClient.clear()
    // Store user in React state (re-renders consumers on change)
    setUser(authUser)
    // Store token in the module-level token store so apiFetch() can read it
    // without needing React context access
    setToken(token)
  }, [queryClient])

  const logout = useCallback(() => {
    setUser(null)
    clearToken()
    // SECURITY: discard every cached server response (see header comment).
    queryClient.clear()
  }, [queryClient])

  // REFERENCE-STAGE: session expiry (dormant under stubs — they never 401).
  // When apiFetch() sees a 401, it signals the sessionExpiry bridge; the
  // handler registered here ends the session exactly like a logout and tells
  // the user why. No redirect code needed: logout() sets user to null, and
  // ProtectedRoute already redirects to /login whenever user is null.
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      logout()
      showErrorToast('Your session has expired. Please sign in again.')
    })
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
