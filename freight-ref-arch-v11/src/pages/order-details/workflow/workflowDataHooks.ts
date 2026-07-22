// =============================================================================
// WHAT: Order Details page data hooks
// ROLE: Data hooks used only by the Order Details page. Grouped here in the
//       page folder because they are single-page — no other page uses them.
//       (The order READ, useOrderQuery, is multi-page and lives in
//       shared/data/ instead. These two workflow mutations are details-only.)
//
// STANDARD MUTATION HOOK INTERFACE (cc27 / Backend Interaction / Hook Standard Interfaces):
//   Every mutation hook returns: { mutate, isPending, isError, error, isSuccess }
//   The mutate function is named descriptively (e.g. approveOrder) so
//   orchestration hook code reads naturally.
//
// CACHE INVALIDATION:
//   After a successful mutation, TanStack Query cache entries are invalidated
//   so the next read of that data fetches fresh data from the server.
//   This is the server-authoritative pattern in action — after an action,
//   the frontend discards its cached state and reloads from the backend.
//
//   NOTE: queryClient.invalidateQueries is used here. This is the ONLY place
//   TanStack Query internals appear in a non-query hook. It is acceptable
//   because cache invalidation is the mutation hook's responsibility.
//
// BACKEND CALLS:
//   Every hook calls apiFetch(). apiFetch() is the single gateway to the
//   backend — in stub mode it routes to the local stubs, in production it
//   makes a real HTTP request. Neither this hook nor anything above it
//   knows or cares which; that switch lives entirely inside apiFetch().
// =============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/app/apiFetch'

// --- useApproveOrderMutation ---------------------------------------------

export function useApproveOrderMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (orderId: string) =>
      apiFetch<void>(`/orders/${orderId}/approve`, { method: 'POST' }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return {
    approveOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}

// --- useCancelOrderMutation ----------------------------------------------

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (orderId: string) =>
      apiFetch<void>(`/orders/${orderId}/cancel`, { method: 'POST' }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return {
    cancelOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}

// --- useDispatchOrderMutation --------------------------------------------

export function useDispatchOrderMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (orderId: string) =>
      apiFetch<void>(`/orders/${orderId}/dispatch`, { method: 'POST' }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return {
    dispatchOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
