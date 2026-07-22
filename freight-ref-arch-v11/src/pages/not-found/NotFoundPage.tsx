// =============================================================================
// WHAT: Not Found page
// ROLE: Shown when the URL matches no route (the router's '*' catch-all).
//       JSX and layout only — logic in useNotFoundPage().
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction / Centralised Routing):
//   Without this page, an unmatched URL (e.g. a mistyped bookmark) would fall
//   through to React Router's default error screen. The '*' route in
//   app/Router.tsx sits INSIDE the protected shell, so the TopNav stays
//   visible and the user can simply navigate on.
//
//   This is a normal page: it follows the page-folder anatomy (Page + hook)
//   like every other page — the rule has no exceptions, however small the page.
// =============================================================================

import { Button } from '@/components/ui/button'
import { PageContent } from '@/shared/technical-components/PageContent'
import { PageStatus } from '@/shared/technical-components/PageStatus'
import { useNotFoundPage } from './useNotFoundPage'

// PAGE: JSX and layout only. All logic delegated to useNotFoundPage().
export function NotFoundPage() {
  const {
    // handlers
    handleGoToOrders,
  } = useNotFoundPage()

  return (
    <PageContent>
      <PageStatus
        title="Page not found"
        message="The address you followed does not match any page in this application."
      >
        <Button variant="outline" onClick={handleGoToOrders}>
          Go to Orders
        </Button>
      </PageStatus>
    </PageContent>
  )
}
