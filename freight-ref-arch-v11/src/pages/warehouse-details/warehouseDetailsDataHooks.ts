// =============================================================================
// WHAT: Warehouse Details page data hooks
// ROLE: Data hooks used only by the Warehouse Details page. Grouped here in
//       the page folder because they are single-page — no other page uses them.
//       Same patterns as the order data hooks.
//
// STANDARD INTERFACES (cc27 / Backend Interaction / Hook Standard Interfaces):
//   Query hooks:    { data, isPending, isError, error }
//   Mutation hooks: { mutate, isPending, isError, error, isSuccess }
//
// BACKEND CALLS:
//   Every hook calls apiFetch(). apiFetch() is the single gateway to the
//   backend — in stub mode it routes to the local stubs, in production it
//   makes a real HTTP request. Neither this hook nor anything above it
//   knows or cares which; that switch lives entirely inside apiFetch().
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/app/apiFetch'
import type { Warehouse, AddAllocationPayload } from './warehouseDetailsTypes'

// --- useWarehouseQuery ---------------------------------------------------

export function useWarehouseQuery(warehouseId: string) {
  return useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: () => apiFetch<Warehouse>(`/warehouses/${warehouseId}`),
    enabled: Boolean(warehouseId),
  })
}

// --- useAddAllocationMutation --------------------------------------------

export function useAddAllocationMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ warehouseId, payload }: { warehouseId: string; payload: AddAllocationPayload }) =>
      apiFetch<{ allocationId: string }>(`/warehouses/${warehouseId}/allocations`, { method: 'POST', body: payload }),
    onSuccess: (_, { warehouseId }) => {
      // Invalidate warehouse cache so the page reloads with the new allocation
      queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] })
    },
  })

  return {
    addAllocation: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}

// --- useRemoveAllocationMutation -----------------------------------------

export function useRemoveAllocationMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ warehouseId, allocationId }: { warehouseId: string; allocationId: string }) =>
      apiFetch<void>(`/warehouses/${warehouseId}/allocations/${allocationId}`, { method: 'DELETE' }),
    onSuccess: (_, { warehouseId }) => {
      queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] })
    },
  })

  return {
    removeAllocation: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
