// =============================================================================
// WHAT: Order Details tab path slugs — single source of truth
// ROLE: The URL slug for each Order Details tab, defined exactly once. Both the
//       router (app/Router.tsx, which builds the nested routes) and the tab bar
//       (useOrderDetailsLayout -> PageTabs, which builds the links) reference
//       these constants, so a tab's slug can never drift between the two.
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction / Centralised Routing):
//   Defining each slug here — rather than as string literals in both the router
//   and the tab list — removes the duplication that would otherwise let a route
//   and its tab link silently diverge on a rename.
// =============================================================================

export const ORDER_DETAIL_TAB_PATHS = {
  info:      'info',
  lineItems: 'line-items',
  workflow:  'workflow',
} as const
