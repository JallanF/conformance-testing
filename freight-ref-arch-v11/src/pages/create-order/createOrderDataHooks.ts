// =============================================================================
// WHAT: Create Order page data hooks
// ROLE: Data hooks used only by the Create Order page. Grouped here in the
//       page folder because they are single-page — no other page uses them.
//
// STANDARD MUTATION HOOK INTERFACE (cc27 / Backend Interaction / Hook Standard Interfaces):
//   Every mutation hook returns: { mutate, isPending, isError, error, isSuccess }
//   The mutate function is named descriptively (e.g. createOrder) so
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
import type { CreateOrderPayload } from './createOrderTypes'

// --- useCreateOrderMutation ----------------------------------------------

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      apiFetch<{ orderId: string }>('/orders', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return {
    createOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  }
}
