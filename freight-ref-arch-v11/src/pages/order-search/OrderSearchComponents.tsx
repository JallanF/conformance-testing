// =============================================================================
// WHAT: Page-local components for the Order Search page
// ROLE: All components used only by the Order Search page, bundled in the
//       page's single [PageName]Components.tsx file (cc27 / Frontend Structure).
//
// COMPONENTS IN THIS FILE:
//   OrderSearchFilterBar — controlled Technical Component (filter inputs)
//   OrdersGrid           — Business Component (order columns, wraps DataGrid)
// =============================================================================

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderStatusBadge } from '@/shared/business-components/OrderStatusBadge'
import { DataGrid, type GridColumn } from '@/shared/technical-components/DataGrid'
import { formatDateShort } from '@/shared/utils/formatDate'
import type { OrderSummary } from '@/shared/contracts/orderContracts'
import type { OrderFilters } from './orderSearchTypes'

// =============================================================================
// WHAT: OrderSearchFilterBar — page-local Technical Component
// ROLE: Renders the order-search filter inputs (customer, status, date range)
//       and the Search/Clear buttons.
//
// CONTROLLED TECHNICAL COMPONENT (cc27 / Screen Composition / Filter and Search Forms):
//   This is a Technical Component, NOT a Business Component — it does NOT own
//   its state and does NOT use the pull pattern. Filter state lives in the
//   order-search orchestration hook (useState, because filters are page-level
//   UI state that controls what is fetched — not business data being edited).
//   Values flow down via `filters`; changes flow up via the on* callbacks.
//
//   It is extracted here (page-local) purely to name a meaningful part of the
//   page — the page then reads as a composition (filter bar + grid). Search
//   pages follow this same pattern: a page-local `…FilterBar` controlled
//   Technical Component with its filter state held by the orchestration hook.
//
// SELECT USAGE — CONTROLLED, NO Controller (cc27 / Selects and Controlled Inputs):
//   The RA uses ui/select two ways. INSIDE a React Hook Form form it connects
//   through RHF's Controller. Here there is NO form — filters are plain
//   useState in the hook — so the Select runs in its ordinary controlled mode:
//   value down, onValueChange up. Same component, two wirings, chosen by
//   whether RHF owns the state.
// =============================================================================

const STATUS_OPTIONS = [
  { value: '',          label: 'All statuses'  },
  { value: 'pending',   label: 'Pending'       },
  { value: 'approved',  label: 'Approved'      },
  { value: 'dispatched',label: 'Dispatched'    },
  { value: 'cancelled', label: 'Cancelled'     },
]

interface OrderSearchFilterBarProps {
  filters: OrderFilters
  onFilterChange: (field: keyof OrderFilters, value: string) => void
  onSearch: () => void
  onClear: () => void
}

export function OrderSearchFilterBar({ filters, onFilterChange, onSearch, onClear }: OrderSearchFilterBarProps) {
  return (
    <div className="mb-5 rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Search filters
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-45 flex-col gap-1.5">
          <Label htmlFor="filter-customer">Customer name</Label>
          <Input
            id="filter-customer"
            type="text"
            placeholder="Search by customer…"
            value={filters.customerName}
            onChange={event => onFilterChange('customerName', event.target.value)}
            onKeyDown={event => event.key === 'Enter' && onSearch()}
          />
        </div>

        <div className="flex min-w-45 flex-col gap-1.5">
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={value => onFilterChange('status', value ?? '')}
            // items gives SelectValue the value→label mapping, so the CLOSED
            // trigger shows "Pending", not the raw value "pending".
            items={STATUS_OPTIONS}
          >
            <SelectTrigger id="filter-status" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(statusOption => (
                <SelectItem key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-45 flex-col gap-1.5">
          <Label htmlFor="filter-from">Order date from</Label>
          <Input
            id="filter-from"
            type="date"
            value={filters.dateFrom}
            onChange={event => onFilterChange('dateFrom', event.target.value)}
          />
        </div>

        <div className="flex min-w-45 flex-col gap-1.5">
          <Label htmlFor="filter-to">Order date to</Label>
          <Input
            id="filter-to"
            type="date"
            value={filters.dateTo}
            onChange={event => onFilterChange('dateTo', event.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={onSearch}>Search</Button>
          <Button variant="outline" onClick={onClear}>Clear</Button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// WHAT: OrdersGrid — Business Component
// ROLE: Renders the orders list grid. Knows the order type and defines
//       order-specific columns including status badge rendering.
//       Wraps the generic DataGrid Technical Component.
//
// COMPONENT HIERARCHY:
//   OrderSearchPage
//     OrdersGrid (Business Component — order domain knowledge)
//       DataGrid  (Technical Component — generic grid mechanics)
//
// ARCHITECTURE NOTE:
//   The split between OrdersGrid and DataGrid separates concerns cleanly:
//     OrdersGrid knows WHAT to display (order columns, status badges, formatting)
//     DataGrid knows HOW to display it (sorting, pagination, loading states)
//
//   This is a DISPLAY-ONLY Business Component — it does not follow the pull
//   pattern because it contains no editable form state. It receives data
//   and raises events (onRowClick) to the Page.
//
// SEE ALSO:
//   shared/technical-components/DataGrid.tsx — the generic Technical Component used here
//   pages/order-search/useOrderSearchPage.ts — provides data and handlers
// =============================================================================

interface OrdersGridProps {
  orders: OrderSummary[]
  isLoading: boolean
  isError: boolean
  onRowClick: (orderId: string) => void
}

// BUSINESS COMPONENT — knows the order domain, defines order-specific columns.
// Status rendering uses the SHARED OrderStatusBadge — the badge started here
// page-local and GRADUATED to shared/business-components when the Order Info
// tab needed the identical rendering (cc27 / Frontend Structure).
export function OrdersGrid({ orders, isLoading, isError, onRowClick }: OrdersGridProps) {

  // Column definitions — this is the Business Component's main responsibility.
  // The Technical Component (DataGrid) receives these and handles rendering.
  // RULE: every sortable column declares sortValue — the RAW value to sort by.
  // render() is for display only (JSX badges, formatted dates); sorting always
  // uses the underlying value (e.g. the ISO date, so ordering is correct).
  const columns: GridColumn<OrderSummary>[] = [
    {
      key: 'orderId',
      header: 'Order ID',
      sortable: true,
      sortValue: (row) => row.orderId,
      render: (row) => <span className="font-mono text-xs">{row.orderId}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      sortValue: (row) => row.customerName,
      render: (row) => row.customerName,
    },
    {
      key: 'orderDate',
      header: 'Date',
      sortable: true,
      // Sort by the ISO date (2024-01-15) — the DISPLAYED form (15/01/2024)
      // would sort day-first, putting 03/02 before 15/01.
      sortValue: (row) => row.orderDate,
      render: (row) => formatDateShort(row.orderDate),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      key: 'warehouseLocation',
      header: 'Location',
      sortable: true,
      sortValue: (row) => row.warehouseLocation,
      render: (row) => row.warehouseLocation,
    },
    {
      key: 'orderedBy',
      header: 'Ordered By',
      sortable: true,
      sortValue: (row) => row.orderedBy,
      render: (row) => row.orderedBy,
    },
  ]

  return (
    <DataGrid
      columns={columns}
      data={orders}
      keyExtractor={(row) => row.orderId}
      onRowClick={(row) => onRowClick(row.orderId)}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Could not load orders. Please try again."
      emptyMessage="No orders match your search criteria. Try adjusting the filters."
    />
  )
}
