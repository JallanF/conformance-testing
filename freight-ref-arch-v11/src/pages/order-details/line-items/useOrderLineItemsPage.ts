// =============================================================================
// WHAT: Order Line Items tab orchestration hook
// ROLE: Logic for the Line Items tab — read-only display of the order's line
//       items.
//
// SELF-CONTAINED ROUTE (cc27 / Backend Interaction / Centralised Routing):
//   Fetches line items via useOrderLineItemsQuery from the tab's OWN endpoint
//   (/orders/:id/line-items), independently of the order query used by the
//   layout and the Info tab. This tab depends on nothing passed in — it reads
//   the orderId from the URL and fetches what it needs.
// =============================================================================

import { useParams } from 'react-router'
import { useOrderLineItemsQuery } from './lineItemsDataHooks'

export function useOrderLineItemsPage() {
  const { orderId = '' } = useParams()
  const { data: lineItems, isPending: isLoading, isError } = useOrderLineItemsQuery(orderId)

  return {
    // data
    lineItems,
    // status flags
    isLoading,
    isError,
  }
}
