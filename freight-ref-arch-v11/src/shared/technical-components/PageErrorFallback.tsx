// =============================================================================
// WHAT: Page-level error fallback — rendered by React Router's errorElement
// ROLE: The friendly UI shown when a page throws an unexpected runtime error.
//       React Router provides the error boundary; this component is only the
//       fallback content.
//
// ARCHITECTURE NOTE (cc27 / Error Handling):
//   Two categories of error are handled differently:
//     EXPECTED errors  — API failures, validation errors — are handled by
//                        hooks and shown via PageMessage or field messages.
//     UNEXPECTED errors — component crashes, null dereferences — are caught
//                        by a route-level error boundary, which renders this
//                        fallback instead of crashing the whole application.
//
//   HOW IT WORKS: every page route in app/Router.tsx declares
//     errorElement: <PageErrorFallback />
//   createBrowserRouter wraps each such route in an error boundary of its own.
//   If a page (or a tab) crashes, only THAT route is replaced by this fallback
//   — the surrounding shell (TopNav; and for tabs, the Order Details header
//   and tab bar) keeps working.
//
//   WHY NOT A HAND-WRITTEN CLASS COMPONENT? React's manual error-boundary API
//   does require a class component. But React Router — already this app's
//   router — provides route-level error boundaries natively via errorElement,
//   so the application writes no boundary code of its own and contains no
//   class components at all.
//
// SEE ALSO:
//   app/Router.tsx — errorElement declared on every page route
//   shared/technical-components/PageMessageBanner.tsx — for expected, handled errors
// =============================================================================

import { useEffect } from 'react'
import { useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'
import { logError } from '@/app/errorLog'
import { PageContent } from '@/shared/technical-components/PageContent'

export function PageErrorFallback() {
  // The error React Router caught for this route. Typed unknown — a component
  // can throw anything, so we check before reading a message off it.
  const error = useRouteError()

  useEffect(() => {
    // Report through the single error-reporting gateway (One Vendor, One Layer).
    // logError() is the ONLY error-reporting call; swapping console.error for a
    // real reporter (Sentry, …) is a change to app/errorLog.ts alone.
    logError(error, { source: 'PageErrorFallback' })
  }, [error])

  const errorMessage = error instanceof Error ? error.message : null

  return (
    <PageContent>
      <div className="px-6 py-12 text-center">
        <div className="mb-2 text-lg font-semibold">Something went wrong</div>
        <div className="mx-auto mb-5 max-w-90 text-sm text-muted-foreground">
          An unexpected error occurred on this page.
          {errorMessage && (
            <span className="mt-2 block font-mono text-xs">
              {errorMessage}
            </span>
          )}
        </div>
        {/* Return to a known-good page. Deliberately a plain <a> (full page
            reload): a hard reload after an unexpected crash clears any
            corrupted in-memory state. (Contrast: normal pages navigate
            client-side via useNavigate.) The Button renders AS the anchor
            via Base UI's render prop — one element, correct semantics. */}
        <Button variant="outline" render={<a href="/orders" />}>
          Return to home
        </Button>
      </div>
    </PageContent>
  )
}
