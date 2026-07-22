// =============================================================================
// WHAT: Root application component
// ROLE: Composes all application-level providers in the correct order, and
//       mounts the app-wide toast portal.
//
// PROVIDER ORDER (outermost first — each provider wraps everything below it):
//   ThemeProvider  — light/dark theme (Application State). Outermost: it
//                    depends on nothing and only touches the <html> class.
//   QueryProvider  — TanStack Query client. It depends on nothing, while
//                    AuthProvider (inside it) needs the query
//                    client to clear cached server state on login/logout.
//   AuthProvider   — AuthContext (Application State) — current user / session.
//                    Must be inside QueryProvider (it calls useQueryClient)
//                    and outside the Router so ProtectedRoute can read it.
//   Router         — defines all routes and renders the matched page.
//
// TOASTS (cc27 / State Management / Toasts and Page Messages):
//   <NotificationsPortal/> renders the toast portal OUTSIDE the Router, so a
//   toast fired just before a navigation (e.g. "Order saved" as the Edit page
//   returns to the read-only view) survives the page change. Orchestration
//   hooks fire toasts via showSuccessToast()/showErrorToast() — the toast
//   library itself is known only by app/Notifications.tsx.
//
// SEE ALSO:
//   app/QueryProvider.tsx  — provides the TanStack Query client
//   app/AuthProvider.tsx   — provides AuthContext (Application State)
//   app/Notifications.tsx  — the notification gateway (single sonner import)
//   app/Router.tsx         — defines all routes
// =============================================================================

import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { NotificationsPortal } from './Notifications'
import { Router } from './Router'
import { ThemeProvider } from './ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      {/* TooltipProvider: shadcn/Base UI requirement — one provider for all
          tooltips (shared delay/grouping). UI-only, so it sits with Theme. */}
      <TooltipProvider>
        <QueryProvider>
          <AuthProvider>
            <Router />
            {/* App-wide toast portal — above the router, so toasts survive navigation */}
            <NotificationsPortal />
          </AuthProvider>
        </QueryProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
