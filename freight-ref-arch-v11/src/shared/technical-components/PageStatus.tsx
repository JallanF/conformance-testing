// =============================================================================
// WHAT: PageStatus — reusable Technical Component
// ROLE: The standard centred block a page (or tab) shows INSTEAD of its normal
//       content while it cannot render that content yet — loading, error, or
//       not-found. Optional title, a message, and optional action content
//       (e.g. a Back button).
//
// PAGE-LEVEL BY ARCHITECTURE, not by accident. In this RA pages/orchestration
// hooks own data fetching and Business Components are prop-fed (they never
// fetch), so a loading/error/not-found condition is inherently a page concern
// — the page shows this block, then renders the data-ready components. Grids
// handle their OWN in-content loading/empty (ui/spinner, ui/empty), so even
// they don't use this. A component reaching for PageStatus would signal a
// fetch happening below the page — a break from the data-ownership model.
// Hence the `Page…` name, consistent with PageContent / PageTabs /
// PageMessageBanner / PageErrorFallback. (Replaces the legacy `.state-container`
// family — cc27 / Styling.)
//
// TECHNICAL COMPONENT: pure presentational wrapper. No state, no logic.
// =============================================================================

interface PageStatusProps {
  title?: string
  message: string
  children?: React.ReactNode
}

export function PageStatus({ title, message, children }: PageStatusProps) {
  return (
    <div className="px-6 py-12 text-center">
      {title && <div className="mb-2 text-lg font-semibold">{title}</div>}
      <div className="mx-auto mb-5 max-w-90 text-sm text-muted-foreground">{message}</div>
      {children}
    </div>
  )
}
