// =============================================================================
// WHAT: Order data hooks (shared)
// ROLE: Transactional data hooks for the order entity that are used by more
//       than one page. Because they are multi-page, they live in shared/data/
//       rather than in a single page folder.
//
//       (Single-page order data hooks live in their page folder instead —
//       e.g. useOrdersQuery in pages/order-search/, order mutations in the
//       pages that perform them.)
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction):
//   Execution flow for every data fetch:
//     Page orchestration hook → these hooks → TanStack Query → apiFetch → Backend
//
//   Pages know these hooks. These hooks know TanStack Query.
//   Pages do NOT know TanStack Query.
//
// STANDARD HOOK INTERFACE (cc27 / Backend Interaction / Hook Standard Interfaces):
//   Every query hook returns: { data, isPending, isError, error }
//
// BACKEND CALLS:
//   Every hook calls apiFetch(). apiFetch() is the single gateway to the
//   backend — in stub mode it routes to the local stubs, in production it
//   makes a real HTTP request. Neither this hook nor anything above it
//   knows or cares which; that switch lives entirely inside apiFetch().
// =============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/app/apiFetch'
import type { Order } from '@/shared/contracts/orderContracts'

// --- useOrderQuery -------------------------------------------------------
// Fetches a single order by ID. Used by OrderDetailsPage and EditOrderPage.
// The orderId comes from the URL param — this is how data passes between pages.

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiFetch<Order>(`/orders/${orderId}`),
    enabled: Boolean(orderId),
  })
}
