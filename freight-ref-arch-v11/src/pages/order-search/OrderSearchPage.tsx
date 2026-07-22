// =============================================================================
// WHAT: Order Search page
// ROLE: Provides order search and navigation. All logic in useOrderSearchPage().
//       This component contains only JSX and layout.
//
// ARCHITECTURE NOTE (cc27 / Screen Composition / The Page Orchestration Hook):
//   Pages contain JSX only. No logic. No state. No API calls.
//   Logic is in the page orchestration hook. Components receive props.
//   If something is not JSX or layout, it does not belong in the Page.
//
// PATTERNS DEMONSTRATED:
//   - Filter form with useState (not React Hook Form — search params, not business data)
//   - Business Component: OrdersGrid (knows order columns, wraps DataGrid)
//   - Technical Component: DataGrid (sorts, paginates, handles states)
//   - Navigation: clicking a row navigates to /orders/:orderId (URL param pattern)
// =============================================================================

import { Button } from '@/components/ui/button'
import { PageContent } from '@/shared/technical-components/PageContent'
import { useOrderSearchPage } from './useOrderSearchPage'
import { OrderSearchFilterBar, OrdersGrid } from './OrderSearchComponents'

// PAGE: Layout and JSX only. All logic delegated to useOrderSearchPage().
export function OrderSearchPage() {
  const {
    // data
    filters,
    orders,
    // status flags
    isLoading,
    isError,
    // derived booleans
    hasSearched,
    // handlers
    handleFilterChange,
    handleSearch,
    handleClearFilters,
    handleRowClick,
    handleNewOrder,
  } = useOrderSearchPage()

  return (
    <PageContent>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <Button onClick={handleNewOrder}>+ New Order</Button>
      </div>

      <OrderSearchFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      {/* Initial state — user has not searched yet */}
      {!hasSearched && (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          Enter search criteria above and click Search to find orders.
        </div>
      )}

      {/* BUSINESS COMPONENT: OrdersGrid — knows order columns.
          Wraps the generic DataGrid Technical Component.
          Row clicks raise handleRowClick to this Page, which navigates. */}
      {hasSearched && (
        <OrdersGrid
          orders={orders}
          isLoading={isLoading}
          isError={isError}
          onRowClick={handleRowClick}
        />
      )}
    </PageContent>
  )
}
