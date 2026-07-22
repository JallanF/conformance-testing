// =============================================================================
// WHAT: Line Items tab data hooks (single-tab)
// ROLE: Transactional data hook for the order's line items. Used by ONLY the
//       Line Items tab, so it lives in the tab folder rather than shared/data/
//       (cc27 / Frontend Structure — used-by-one lives with its page; shared/data/ is for
//       hooks used by more than one page).
//
// WHY A SEPARATE QUERY (cc27 / Backend Interaction / Centralised Routing):
//   The Line Items tab fetches its data from its OWN endpoint
//   (/orders/:id/line-items) rather than reading line items off the shared
//   order object. This demonstrates that tabs under a layout are
//   self-contained: each fetches what IT needs. When two tabs happen to need
//   the same query, TanStack Query dedupes it — but that sharing is an
//   opportunistic optimisation, not a coupling the architecture requires.
// =============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/app/apiFetch'
import type { OrderLineItem } from '@/shared/contracts/orderContracts'

// Fetches the line items for a single order by ID.
// Distinct query key from the order fetch, so it is cached and refetched
// independently of useOrderQuery.
export function useOrderLineItemsQuery(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId, 'line-items'],
    queryFn: () => apiFetch<OrderLineItem[]>(`/orders/${orderId}/line-items`),
    enabled: Boolean(orderId),
  })
}
