// =============================================================================
// WHAT: Order Search page orchestration hook
// ROLE: Contains all logic for the Order Search page. The OrderSearchPage
//       component contains only JSX and layout.
//
// ARCHITECTURE NOTE (cc27 / Screen Composition / The Page Orchestration Hook):
//   This hook is the orchestration layer for the search page. It:
//     - Owns filter form state (UI state — useState, not React Hook Form)
//     - Manages the distinction between "editing filters" and "applied filters"
//     - Calls the server state hook with applied filters
//     - Returns everything the Page JSX needs
//
//   FILTER STATE vs APPLIED FILTER STATE:
//     filters        — what the user is currently typing/selecting in the form
//     appliedFilters — what was last submitted (triggers the API call)
//   This prevents the API from firing on every keystroke. The user must
//   click Search to apply filters.
//
//   WHY useState NOT React Hook Form FOR FILTERS
//   (cc27 / Screen Composition / Filter and Search Forms):
//     Search filter forms are UI state — they control what data is fetched.
//     React Hook Form is for editing state — forms that validate and submit
//     business data. Filters are simpler; useState is appropriate here.
// =============================================================================

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useOrdersQuery } from './orderSearchDataHooks'
import type { OrderFilters } from './orderSearchTypes'

const EMPTY_FILTERS: OrderFilters = {
  customerName: '',
  status: '',
  dateFrom: '',
  dateTo: '',
}

export function useOrderSearchPage() {
  const navigate = useNavigate()

  // PATTERN: UI state for filter form — useState, not React Hook Form.
  // These are not business editing fields; they are search criteria.
  const [filters, setFilters] = useState<OrderFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<OrderFilters>(EMPTY_FILTERS)
  const [hasSearched, setHasSearched] = useState(false)

  // PATTERN: Server state via hook → TanStack Query → stub/API
  // appliedFilters drives the query; hasSearched gates it, so no fetch happens
  // until the user clicks Search (the query re-runs when appliedFilters change).
  const { data: orders, isPending, isError } = useOrdersQuery(appliedFilters, hasSearched)

  // Called when a filter field changes — updates editing state only.
  // Does NOT trigger an API call.
  const handleFilterChange = (field: keyof OrderFilters, value: string) => {
    setFilters((previousFilters: OrderFilters) => ({ ...previousFilters, [field]: value }))
  }

  // Called when the user clicks Search.
  // Applies current filters → triggers the API call via TanStack Query.
  const handleSearch = () => {
    setAppliedFilters(filters)
    setHasSearched(true)
  }

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setHasSearched(false)
  }

  // PATTERN: URL params for page navigation
  // (cc27 / Backend Interaction / Passing Data Between Pages)
  // Clicking a row navigates to /orders/:orderId.
  // The OrderDetailsPage reads orderId from the URL and re-fetches.
  const handleRowClick = (orderId: string) => {
    navigate(`/orders/${orderId}`)
  }

  // PATTERN: Client-side navigation for the "New Order" action.
  // Uses navigate() (not a plain <a href>) so the transition stays within the
  // SPA — no full-page reload — consistent with handleRowClick above.
  const handleNewOrder = () => {
    navigate('/orders/create')
  }

  return {
    // data
    filters,
    orders: orders ?? [],
    // status flags
    // Orchestration hooks expose isLoading to the Page; isPending is the
    // TanStack-layer name used by the data hooks (cc27 / Hook Standard Interfaces).
    isLoading: hasSearched && isPending,
    isError: hasSearched && isError,
    // derived booleans
    hasSearched,
    // handlers
    handleFilterChange,
    handleSearch,
    handleClearFilters,
    handleRowClick,
    handleNewOrder,
  }
}
