// =============================================================================
// WHAT: Login page
// ROLE: Public page (no authentication required). Renders the LoginForm
//       Business Component. Delegates all logic to useLoginPage().
//
// ARCHITECTURE NOTE (cc27 / Screen Composition / The Page Orchestration Hook):
//   The Page contains only JSX and layout. All logic lives in the
//   page orchestration hook (useLoginPage). The Page:
//     - Calls the orchestration hook
//     - Passes derived props and handlers to Business Components
//     - Contains no business logic itself
//
// STYLING (cc27 / Styling):
//   Layout is Tailwind utilities; the card is the ui/card vendor-zone
//   component. Pages import ui/ primitives directly — that is idiomatic
//   shadcn and the RA's rule (DECISIONS-LOG D4).
//
// PUBLIC ROUTE:
//   This page does not sit inside <ProtectedRoute>. It is accessible without
//   authentication. See app/Router.tsx for the route configuration.
// =============================================================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLoginPage } from './useLoginPage'
import { LoginForm } from './LoginComponents'

// PAGE: contains only JSX and layout. No logic.
export function LoginPage() {
  const {
    // status flags
    isPending,
    // derived
    errorMessage,
    // handlers
    handleSubmit,
  } = useLoginPage()

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">FreightOS</CardTitle>
          <CardDescription>Sign in to the freight management system</CardDescription>
        </CardHeader>

        <CardContent>
          {/* BUSINESS COMPONENT: LoginForm owns its form state.
              The Page passes handlers and receives events. */}
          <LoginForm
            onSubmit={handleSubmit}
            isPending={isPending}
            errorMessage={errorMessage}
          />

          {/* Development hint — remove in production */}
          <div className="mt-6 rounded-md bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <strong>Demo credentials:</strong><br />
            manager@freightos.com / password<br />
            operator@freightos.com / password<br />
            admin@freightos.com / password
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
