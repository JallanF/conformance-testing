// =============================================================================
// WHAT: Order search query params (page-owned)
// ROLE: The filter shape sent to the backend with each order-search request.
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   This is a request contract, but a PAGE-OWNED one: it is used only by the
//   order-search page (and mirrored by the stub backend). Per the page-first
//   rule, a contract used by a single page lives with that page, not in
//   shared/contracts/. If the server later generalises it into a reusable
//   query DTO, it graduates to shared/contracts/.
// =============================================================================

export interface OrderFilters {
  customerName: string
  status: string
  dateFrom: string
  dateTo: string
}
