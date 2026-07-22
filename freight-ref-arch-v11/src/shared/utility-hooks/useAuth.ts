// =============================================================================
// WHAT: useAuth hook
// ROLE: Provides clean, safe access to AuthContext (Application State).
//       Throws a clear error if used outside AuthProvider (common mistake).
//
// ARCHITECTURE NOTE:
//   cc27 / State Management / AuthContext (Application State) Scope
//
//   This is one of the rare genuinely reusable shared hooks (cc27 / Frontend
//   Structure keeps utility-hooks/ for "genuinely reusable hooks only").
//   useAuth() is called by:
//     - ProtectedRoute (to check authentication)
//     - TopNav (to display the user's name/role and handle logout)
//     - useLoginPage (to store the user on login)
//
//   It is NEVER called inside Business Components. Note that page orchestration
//   hooks no longer read the role to gate visibility either — permissions are
//   presence-driven (cc26 / Security and Permissions): the FE renders on the
//   data the server chose to send, not on the user's role.
//
// SEE ALSO:
//   app/AuthProvider.tsx — defines AuthContext and AuthContextValue
// =============================================================================

import { useContext } from 'react'
import { AuthContext } from '@/app/AuthProvider'
import type { AuthContextValue } from '@/app/AuthProvider'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth() must be used within an <AuthProvider>. Check your provider tree.')
  }
  return context
}
