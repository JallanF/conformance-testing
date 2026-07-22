// =============================================================================
// WHAT: Reference data hooks (shared)
// ROLE: Query hooks for genuine reference data — domain-neutral lookups.
//
// ARCHITECTURE NOTE:
//   cc27 / Backend Interaction
//   cc27 / DTO and Type Guidance
//
//   These use the …ReferenceDataQuery suffix, reserved for TRUE reference data
//   (see shared/reference-data/referenceDataTypes.ts). Domain-entity reads that
//   merely populate selectors (customers, carriers, products) are ordinary
//   …Query hooks and live in shared/data/selectorDataHooks.ts.
//
// STANDARD HOOK INTERFACE (cc27 / Backend Interaction / Hook Standard Interfaces):
//   Returns { data, isPending, isError, error } and calls apiFetch().
// =============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/app/apiFetch'
import type { ServiceLevel } from './referenceDataTypes'

// --- useServiceLevelsReferenceDataQuery ----------------------------------
// Fetches the available shipping service levels for the create-order wizard.
export function useServiceLevelsReferenceDataQuery() {
  return useQuery({
    queryKey: ['service-levels'],
    queryFn: () => apiFetch<ServiceLevel[]>('/reference-data/service-levels'),
  })
}
