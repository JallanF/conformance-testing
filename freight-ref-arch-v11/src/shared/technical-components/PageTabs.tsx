// =============================================================================
// WHAT: Page tabs — Level 2 navigation (route-based)
// ROLE: Within-page tab navigation. Renders a tab bar where each tab is a
//       link to a nested route. Switching tabs is a route change; the page
//       layout around the tabs does not re-mount.
//
// NAVIGATION LEVELS:
//   Level 1: TopNav.tsx — navigation between feature areas (Orders, Warehousing)
//   Level 2: PageTabs (here) — navigation between nested routes within a page
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction / Centralised Routing):
//   Tabs are implemented as nested routes under a layout route. Each tab is a
//   React Router <NavLink>. React Router automatically applies the active
//   styling to the link matching the current URL — so there is no activeTab
//   state to manage. The layout renders <PageTabs/> above an <Outlet/>; the
//   Outlet shows the active tab's page.
//
// WHY NOT ui/tabs? The shadcn/Base UI Tabs component owns which tab is active
//   as ITS OWN state — the right tool for local tab switching. Here the ROUTER
//   owns the active tab (each tab is a URL), so a stateful tabs primitive is
//   the wrong tool. This stays a home-grown Technical Component, styled with
//   Tailwind utilities; the NavLink's { isActive } flag chooses the classes
//   (the data-driven class rule, cc27 / Styling).
//
// TECHNICAL COMPONENT: pure props in. No business logic, no internal state.
// =============================================================================

import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

export interface Tab {
  label: string
  // The nested-route path this tab links to (relative to the layout route).
  path: string
}

interface PageTabsProps {
  tabs: Tab[]
  // The base path the tab paths are relative to (e.g. '/orders/123').
  basePath: string
}

// TECHNICAL COMPONENT: renders each tab as a NavLink to its nested route.
export function PageTabs({ tabs, basePath }: PageTabsProps) {
  return (
    // The bottom border is full-bleed (edge-to-edge under the TopNav), so it
    // sits on the OUTER element. The inner tablist matches PageContent's
    // centred max-width + padding, so the tab labels align with the page
    // content below them (PageTabs renders OUTSIDE PageContent — see
    // OrderDetailsLayout — precisely so the border can span the full width).
    <div className="mb-6 border-b">
      <div className="mx-auto flex w-full max-w-[1200px] px-6" role="tablist">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            role="tab"
            to={`${basePath}/${tab.path}`}
            // NavLink passes an { isActive } flag — the className function
            // selects the active classes from it.
            className={({ isActive }) =>
              cn(
                '-mb-px whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
