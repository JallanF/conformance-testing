// =============================================================================
// WHAT: Protected route guard
// ROLE: Wraps all authenticated routes. Redirects unauthenticated users to
//       the login page. Renders child routes if the user is authenticated.
//
// ARCHITECTURE NOTE:
//   This is a standard React Router v6 layout route pattern. It sits in the
//   Router between the public /login route and all protected feature routes.
//   Any page inside the ProtectedRoute wrapper is guaranteed to have an
//   authenticated user available via useAuth().
//
//   The 'replace' prop on <Navigate> ensures the login page replaces the
//   current history entry, so the browser Back button does not return to
//   a protected page after logout.
//
// SEE ALSO:
//   app/Router.tsx       — where ProtectedRoute is used in the route tree
//   app/AuthProvider.tsx — provides the user state read here
//   shared/utility-hooks/useAuth.ts — the hook used to read auth state
// =============================================================================

import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/shared/utility-hooks/useAuth'
import { TopNav } from './TopNav'

// PATTERN: Protected Route (standard React Router v6)
// Outlet renders the matched child route (e.g. OrderSearchPage).
// If not authenticated, redirect to login — no child is rendered.
export function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-svh flex-col">
      <TopNav />
      <Outlet />
    </div>
  )
}
