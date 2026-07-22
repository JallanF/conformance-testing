// =============================================================================
// WHAT: Centralised route configuration
// ROLE: Defines ALL routes in the application in one place. This is the
//       complete navigation map of the application.
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction / Centralised Routing):
//   All routes are defined here centrally. No feature defines its own routes.
//   This is the definitive answer to "what pages does this application have
//   and how do I navigate to them?" — a developer can read this file and
//   understand the entire application structure.
//
// ROUTE STRUCTURE:
//   Public routes  — accessible without authentication
//     /login
//
//   Protected routes — redirect to /login if not authenticated
//     /                    → redirect to /orders
//     /orders              → OrderSearchPage
//     /orders/:orderId     → OrderDetailsLayout (redirects to /info)
//     /orders/:orderId/info       → OrderInfoPage      (tab, nested route)
//     /orders/:orderId/line-items → OrderLineItemsPage (tab, nested route)
//     /orders/:orderId/workflow   → OrderWorkflowPage  (tab, nested route)
//     /orders/:orderId/edit → EditOrderPage      (URL param, triggers re-fetch)
//     /orders/create       → CreateOrderPage
//     /warehousing         → redirect to /warehousing/WH-001
//     /warehousing/:warehouseId → WarehouseDetailsPage
//     *                    → NotFoundPage (catch-all for unmatched URLs)
//
// PATTERN: URL params for page-to-page data passing
// (cc27 / Backend Interaction / Passing Data Between Pages)
//   Data is passed between pages via URL params, NOT via React Router state.
//   On arrival, the destination page re-fetches the entity from the server
//   using the ID from the URL. This is refresh-safe, bookmarkable, and
//   server-authoritative. See useOrderQuery() and useWarehouseQuery() hooks.
//
// PATTERN: Route-level error boundaries (cc27 / Error Handling)
//   Every page route declares errorElement: <PageErrorFallback />.
//   createBrowserRouter provides the error boundary natively — if a page
//   throws during rendering, only that route shows the fallback; the rest of
//   the application keeps working. Each TAB route has its own errorElement,
//   so a crash inside one tab leaves the Order Details header and tab bar
//   alive. The ProtectedRoute layout route also has one, catching crashes in
//   the shell itself (TopNav) — anything a child route did not catch first.
//
// SEE ALSO:
//   app/ProtectedRoute.tsx — the layout wrapper for authenticated routes
//   shared/technical-components/PageErrorFallback.tsx — the error fallback UI
// =============================================================================

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { PageErrorFallback } from '@/shared/technical-components/PageErrorFallback'

// Auth
import { LoginPage } from '@/pages/login/LoginPage'

// Orders
import { OrderSearchPage } from '@/pages/order-search/OrderSearchPage'
import { OrderDetailsLayout } from '@/pages/order-details/OrderDetailsLayout'
import { OrderInfoPage } from '@/pages/order-details/info/OrderInfoPage'
import { OrderLineItemsPage } from '@/pages/order-details/line-items/OrderLineItemsPage'
import { OrderWorkflowPage } from '@/pages/order-details/workflow/OrderWorkflowPage'
import { ORDER_DETAIL_TAB_PATHS } from '@/pages/order-details/orderDetailTabPaths'
import { EditOrderPage } from '@/pages/edit-order/EditOrderPage'
import { CreateOrderPage } from '@/pages/create-order/CreateOrderPage'

// Warehousing
import { WarehouseDetailsPage } from '@/pages/warehouse-details/WarehouseDetailsPage'

// Not Found (the '*' catch-all)
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

const router = createBrowserRouter([
  // --- Public routes -------------------------------------------------------
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <PageErrorFallback />,
  },

  // --- Protected routes ----------------------------------------------------
  // ProtectedRoute renders TopNav + Outlet. Each child renders in the Outlet.
  // errorElement on each page route catches unexpected runtime errors there.
  {
    element: <ProtectedRoute />,
    // Catches crashes in the shell itself (TopNav), or anything a child
    // route's own errorElement did not catch first.
    errorElement: <PageErrorFallback />,
    children: [
      // Root — redirect to Orders (the default feature)
      {
        path: '/',
        element: <Navigate to="/orders" replace />,
      },

      // Orders feature
      {
        path: '/orders',
        element: <OrderSearchPage />,
        errorElement: <PageErrorFallback />,
      },
      {
        // PATTERN: Tabs as nested routes.
        // /orders/:orderId is a LAYOUT route (header + tab bar + Outlet).
        // Its children are the three tabs. Visiting /orders/:orderId with no
        // tab redirects to the Info tab.
        // URL param orderId is used by the layout and each tab to fetch the order.
        path: '/orders/:orderId',
        element: <OrderDetailsLayout />,
        errorElement: <PageErrorFallback />,
        children: [
          { index: true, element: <Navigate to={ORDER_DETAIL_TAB_PATHS.info} replace /> },
          // Each tab declares its OWN errorElement: a crash inside one tab
          // replaces only the tab content — the header and tab bar stay alive.
          { path: ORDER_DETAIL_TAB_PATHS.info,      element: <OrderInfoPage />,      errorElement: <PageErrorFallback /> },
          { path: ORDER_DETAIL_TAB_PATHS.lineItems, element: <OrderLineItemsPage />, errorElement: <PageErrorFallback /> },
          { path: ORDER_DETAIL_TAB_PATHS.workflow,  element: <OrderWorkflowPage />,  errorElement: <PageErrorFallback /> },
        ],
      },
      {
        // Edit is a SEPARATE route, not a tab — it is a different task
        // (editing), not a view of the order. It has its own page.
        path: '/orders/:orderId/edit',
        element: <EditOrderPage />,
        errorElement: <PageErrorFallback />,
      },
      {
        path: '/orders/create',
        element: <CreateOrderPage />,
        errorElement: <PageErrorFallback />,
      },

      // Warehousing feature
      // Redirect /warehousing to the single demo warehouse
      {
        path: '/warehousing',
        element: <Navigate to="/warehousing/WH-001" replace />,
      },
      {
        // PATTERN: URL param — warehouseId passed to page, used to fetch warehouse
        path: '/warehousing/:warehouseId',
        element: <WarehouseDetailsPage />,
        errorElement: <PageErrorFallback />,
      },

      // Catch-all — any URL that matched nothing above. Inside the protected
      // shell, so the TopNav stays visible and the user can navigate on.
      // (Logged-out users never reach it: ProtectedRoute redirects to /login.)
      {
        path: '*',
        element: <NotFoundPage />,
        errorElement: <PageErrorFallback />,
      },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
