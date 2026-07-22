// =============================================================================
// WHAT: Selector data hooks (shared)
// ROLE: Transactional read hooks for the domain entities shown in selectors —
//       customers, a customer's addresses, carriers, products. Used by more
//       than one page (create-order, edit-order), so they live in shared/data/.
//
// ARCHITECTURE NOTE:
//   cc27 / Backend Interaction
//   cc27 / DTO and Type Guidance
//
//   These fetch domain ENTITIES (Customer/Carrier/Product/Address), not
//   reference data — so they are ordinary …Query hooks, NOT …ReferenceDataQuery.
//   Genuine, domain-neutral reference data (e.g. service levels) lives in
//   shared/reference-data/ with the …ReferenceDataQuery suffix.
//
// STANDARD HOOK INTERFACE (cc27 / Backend Interaction / Hook Standard Interfaces):
//   Every query hook returns { data, isPending, isError, error } and calls
//   apiFetch() — the single gateway to the backend.
// =============================================================================

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/app/apiFetch'
import type { Customer, Carrier, Product } from '@/shared/contracts/selectorContracts'
import type { Address } from '@/shared/contracts/addressContracts'

// --- useCustomersQuery ---------------------------------------------------
// Fetches the customer list for dropdowns.
export function useCustomersQuery() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => apiFetch<Customer[]>('/customers'),
  })
}

// --- useCustomerAddressesQuery -------------------------------------------
// Fetches addresses for a specific customer.
// PATTERN: Dependent data loading — this query's enabled flag depends on
// whether a customer has been selected. It re-runs when customerId changes.
// The orchestration hook stores the selected customerId in local state;
// this hook watches it via the query key and enabled flag.
export function useCustomerAddressesQuery(customerId: string | null) {
  return useQuery({
    queryKey: ['customer-addresses', customerId],
    queryFn: () => apiFetch<Address[]>(`/customers/${customerId}/addresses`),
    // Only fetch when a customer has been selected
    enabled: Boolean(customerId),
  })
}

// --- useCarriersQuery ----------------------------------------------------
// Fetches available carriers for the create-order wizard.
export function useCarriersQuery() {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: () => apiFetch<Carrier[]>('/carriers'),
  })
}

// --- useProductsQuery ----------------------------------------------------
// Fetches the product catalogue for line item entry.
export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<Product[]>('/products'),
  })
}
