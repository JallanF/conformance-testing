// =============================================================================
// WHAT: Order Line Items tab page (nested route under Order Details)
// ROLE: Read-only display of the order's line items. JSX and layout only.
// =============================================================================

import { OrderItemsSection } from '@/shared/business-components/OrderItemsSection'
import { PageStatus } from '@/shared/technical-components/PageStatus'
import { useOrderLineItemsPage } from './useOrderLineItemsPage'

export function OrderLineItemsPage() {
  const { lineItems, isLoading, isError } = useOrderLineItemsPage()

  if (isLoading) {
    return <PageStatus message="Loading…" />
  }
  if (isError || !lineItems) {
    return <PageStatus message="Line items could not be loaded." />
  }

  return (
    <OrderItemsSection
      initialLineItems={lineItems}
      canEdit={false}
    />
  )
}
