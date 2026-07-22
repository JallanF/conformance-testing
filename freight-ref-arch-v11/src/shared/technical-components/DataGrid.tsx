// =============================================================================
// WHAT: DataGrid — reusable Technical Component
// ROLE: Renders tabular data with client-side sorting, pagination, and
//       loading/error/empty states. Used by Business Components (OrdersGrid,
//       AllocationsGrid) which provide column definitions and typed data.
//
// COMPONENT HIERARCHY (cc27 / Frontend Structure):
//   Page
//     OrdersGrid (Business Component — orders-specific columns and behaviour)
//       DataGrid  (Technical Component — this file — generic grid mechanics)
//
// IMPLEMENTATION — TanStack Table + ui/table (DECISIONS-LOG D8/D18):
//   The grid ENGINE is TanStack Table (headless — sorting, pagination, row
//   models), rendered with the ui/table vendor-zone components, exactly the
//   shadcn DataTable pattern. Two RA decisions shape this file:
//
//   1. ONE VENDOR, ONE LAYER: @tanstack/react-table is imported ONLY here.
//      Callers use the RA's own GridColumn contract below — they never see a
//      TanStack ColumnDef. Production grid features (column visibility,
//      filtering, server-side pagination) get added inside this one file.
//   2. THE PUBLIC API IS UNCHANGED from the hand-rolled version: the same
//      GridColumn shape and the same props, so Business Components did not
//      change when the engine was swapped — which is the point of the wrapper.
//
// ARCHITECTURE NOTE — Sort and Pagination:
//   Filtering is server-side: search params go to the backend, which returns
//   a filtered result set. This keeps large datasets manageable.
//
//   Sorting and pagination are client-side: within the filtered result set
//   returned by the server. For this application's dataset sizes (tens to
//   low hundreds of rows after filtering), client-side sort is appropriate.
//   Clicking a column header cycles: none → asc → desc → none (TanStack's
//   default toggle cycle). When the data set changes (a new search), TanStack
//   resets to page 1 automatically (autoResetPageIndex) — without this, a
//   user on page 3 of old results would land mid-way through the new ones.
//
//   If a future use case requires server-side pagination (very large
//   datasets), the Page orchestration hook would pass page/pageSize as search
//   params to the query hook, and this component would switch to TanStack's
//   manualPagination with a totalCount prop. The public API stays the same.
//
// TECHNICAL COMPONENT: pure props in, events out. No internal state beyond
//   sort and page (UI state local to the grid itself — owned by TanStack).
// =============================================================================

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

// Column definition — the RA's OWN contract, generic over the row type TRow.
// Business Components define columns in these terms; the mapping to TanStack
// happens privately below.
export interface GridColumn<TRow> {
  key: string                              // Unique column identifier
  header: string                           // Display header text
  sortable?: boolean                       // Whether clicking header sorts
  render: (row: TRow) => React.ReactNode   // How to render the cell value
  // The RAW value to sort by. Every sortable column declares this.
  // WHY: render() output cannot be sorted reliably — JSX (a status badge)
  // stringifies to "[object Object]" for every row, and formatted text sorts
  // wrongly ("15/01/2024" as text, "1,000" as text). sortValue returns the
  // underlying value: numbers compare numerically, strings (incl. ISO dates)
  // compare as text.
  sortValue?: (row: TRow) => string | number
}

interface DataGridProps<TRow> {
  columns: GridColumn<TRow>[]
  data: TRow[]
  keyExtractor: (row: TRow) => string      // Unique key for each row
  onRowClick?: (row: TRow) => void         // Optional row click handler
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  emptyMessage?: string
  pageSize?: number                        // Rows per page (default: 10)
}

// Shared card-style wrapper for the grid and its status states.
function GridShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {children}
    </div>
  )
}

// TECHNICAL COMPONENT — generic over row type TRow
export function DataGrid<TRow>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load data. Please try again.',
  emptyMessage = 'No results found.',
  pageSize = 10,
}: DataGridProps<TRow>) {
  // Map the RA's GridColumn contract onto TanStack ColumnDefs — private to
  // this file. Sortable columns get an accessorFn (the RAW sortValue);
  // non-sortable columns are display-only.
  const tableColumns: ColumnDef<TRow>[] = columns.map(column => ({
    id: column.key,
    header: column.header,
    enableSorting: Boolean(column.sortable),
    accessorFn: column.sortValue ?? (() => ''),
    cell: (cellContext) => column.render(cellContext.row.original),
  }))

  // TanStack owns the grid's UI state (sort, page). Hooks must be called
  // unconditionally, so the table is built before any early return.
  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId: (row) => keyExtractor(row),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    // autoResetPageIndex is on by default: new data → back to page 1.
  })

  // --- Loading state -------------------------------------------------------
  if (isLoading) {
    return (
      <GridShell>
        <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-muted-foreground">
          <Spinner /> Loading…
        </div>
      </GridShell>
    )
  }

  // --- Error state ---------------------------------------------------------
  if (isError) {
    return (
      <GridShell>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Could not load data</EmptyTitle>
            <EmptyDescription>{errorMessage}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </GridShell>
    )
  }

  // --- Empty state ---------------------------------------------------------
  if (data.length === 0) {
    return (
      <GridShell>
        <Empty>
          <EmptyHeader>
            <EmptyDescription>{emptyMessage}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </GridShell>
    )
  }

  const { pageIndex } = table.getState().pagination
  const totalRows = data.length
  const totalPages = table.getPageCount()
  const pageStart = pageIndex * pageSize

  return (
    <GridShell>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const sortDirection = header.column.getIsSorted()  // 'asc' | 'desc' | false
                return (
                  <TableHead
                    key={header.id}
                    className={cn(header.column.getCanSort() && 'cursor-pointer select-none')}
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      sortDirection === 'asc' ? 'ascending'
                        : sortDirection === 'desc' ? 'descending'
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span aria-hidden="true" className="text-muted-foreground">
                          {sortDirection === 'asc' ? <ChevronUp className="size-3.5" />
                            : sortDirection === 'desc' ? <ChevronDown className="size-3.5" />
                            : <ChevronsUpDown className="size-3.5" />}
                        </span>
                      )}
                    </span>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              className={cn(onRowClick && 'cursor-pointer')}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            >
              {row.getVisibleCells().map(cell => (
                // tabular-nums: equal-width digits so numeric columns (and ids)
                // line up vertically. Harmless on non-numeric text.
                <TableCell key={cell.id} className="tabular-nums">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination — only shown when data exceeds one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <span>
            Showing {pageStart + 1}–{Math.min(pageStart + pageSize, totalRows)} of {totalRows} results
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="px-2">
              Page {pageIndex + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </GridShell>
  )
}
