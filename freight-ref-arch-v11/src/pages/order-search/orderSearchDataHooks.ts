// =============================================================================
// WHAT: Order Search page data hooks
// ROLE: Data hooks used only by the Order Search page. Grouped here in the
//       page folder because they are single-page — no other page uses them.
//       (Multi-page order data hooks live in shared/data/ instead.)
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
import type { OrderFilters } from './orderSearchTypes'
import type { OrderSummary } from '@/shared/contracts/orderContracts'

// --- useOrdersQuery ------------------------------------------------------
// Fetches the order list, filtered by the provided search criteria.
// Called by useOrderSearchPage with the current applied filters, and re-runs
// automatically when they change.
//
// `enabled` GATES the fetch: the search page passes hasSearched, so NO request
// is made until the user clicks Search. (Without this the query would fire on
// mount with empty filters — a wasted call that returns the whole list.)

export function useOrdersQuery(filters: OrderFilters, enabled: boolean) {
  return useQuery({
    // Query key includes filters — TanStack Query re-fetches when filters change.
    queryKey: ['orders', filters],
    // The filters are sent as query-string params to the backend.
    // Build the query string explicitly from the known filter fields.
    queryFn: () => {
      const params = new URLSearchParams({
        customerName: filters.customerName,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      })
      return apiFetch<OrderSummary[]>(`/orders?${params}`)
    },
    enabled,
  })
}
