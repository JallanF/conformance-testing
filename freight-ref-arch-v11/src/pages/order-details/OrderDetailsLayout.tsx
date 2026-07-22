// =============================================================================
// WHAT: Order Details layout (persistent shell for the detail tabs)
// ROLE: Renders the order header + Level 2 tab bar + <Outlet/>. The Outlet
//       shows the active tab's page (Info / Line Items / Workflow).
//
// TABS AS NESTED ROUTES:
//   This is a LAYOUT ROUTE. It does not re-mount when the user switches tabs —
//   only the <Outlet/> content changes. This preserves the single-page feel
//   while each tab remains an independent, self-contained route.
//
// SEPARATION OF CONCERNS:
//   The layout owns only what is shared across tabs: the header and the
//   Back/Edit actions. All tab-specific logic lives in each tab's own page
//   and orchestration hook. JSX and layout only here; logic in the hook.
// =============================================================================

import { Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageContent } from '@/shared/technical-components/PageContent'
import { PageTabs } from '@/shared/technical-components/PageTabs'
import { PageStatus } from '@/shared/technical-components/PageStatus'
import { formatDate } from '@/shared/utils/formatDate'
import { useOrderDetailsLayout, ORDER_DETAIL_TABS } from './useOrderDetailsLayout'

export function OrderDetailsLayout() {
  const {
    // identity
    orderId,
    // data
    order,
    // status flags
    isLoading,
    isError,
    // derived booleans
    canEdit,
    // handlers
    handleEdit,
    handleBack,
  } = useOrderDetailsLayout()

  if (isLoading) {
    return <PageContent><PageStatus message="Loading order…" /></PageContent>
  }

  if (isError || !order) {
    return (
      <PageContent>
        <PageStatus title="Order not found" message={`Order ${orderId} could not be loaded.`}>
          <Button variant="outline" onClick={handleBack}>Back to Orders</Button>
        </PageStatus>
      </PageContent>
    )
  }

  return (
    <>
      {/* PATTERN: Level 2 navigation — tabs are nested routes.
          The tab bar links to /orders/:orderId/{info|line-items|workflow}.
          React Router highlights the active tab from the URL. */}
      <PageTabs tabs={ORDER_DETAIL_TABS} basePath={`/orders/${orderId}`} />

      <PageContent>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{order.orderId}</h1>
            <span className="text-sm text-muted-foreground">
              {order.customerName} · {formatDate(order.orderDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBack}>← Orders</Button>
            {/* Edit is an action — shown iff the server lists it (availableActions). */}
            {canEdit && (
              <Button variant="outline" onClick={handleEdit}>Edit</Button>
            )}
          </div>
        </div>

        {/* The active tab's page renders here. */}
        <Outlet />
      </PageContent>
    </>
  )
}
