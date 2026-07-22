// =============================================================================
// WHAT: Order contracts — server-mirrored DTOs for the order entity
// ROLE: The shape of order data as returned by the backend. These are the
//       frontend's half of a contract shared with the server: both sides must
//       agree on these shapes.
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   Contract types (DTOs) live in shared/contracts/, separate from client-only
//   types (shared/types/). They are placed here — rather than by the page-first
//   "how many pages use it" rule — because they mirror the backend, must stay in
//   sync with it, and are likely to be reused as the app grows. Grouping the
//   contract coherently matters more than today's page-count (e.g. OrderSummary
//   lives here even though only order-search reads it today).
//
//   "Create a new type when the shape is different." OrderSummary (list) and
//   Order (detail) ARE different shapes, so two types are justified.
// =============================================================================

import type { Address } from '@/shared/contracts/addressContracts'

// --- Order Status --------------------------------------------------------
export type OrderStatus = 'pending' | 'approved' | 'dispatched' | 'cancelled'

// --- Order Summary -------------------------------------------------------
// Shape returned by the list/search endpoint.
// Deliberately excludes line items and financials for performance.
export interface OrderSummary {
  orderId: string
  customerName: string
  orderDate: string
  status: OrderStatus
  warehouseLocation: string
  orderedBy: string
}

// --- Order Line Item -----------------------------------------------------
export interface OrderLineItem {
  lineItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

// --- Order Financials ----------------------------------------------------
// PRESENCE-DRIVEN VISIBILITY (cc26 / Security and Permissions):
//   The whole object is optional on Order — the backend omits it for users
//   without financial visibility (e.g. operators). marginPercent is ALSO
//   optional — the backend may send financials but suppress just the margin
//   (e.g. admins). The frontend renders each on PRESENCE, never on role.
export interface OrderFinancials {
  subtotal: number
  tax: number
  total: number
  marginPercent?: number
}

// --- Order ---------------------------------------------------------------
// Full shape returned by the detail endpoint.
export interface Order {
  orderId: string
  customerId: string
  customerName: string
  orderDate: string
  status: OrderStatus
  warehouseLocation: string
  orderedBy: string
  requiresApproval: boolean
  // PATTERN: availableActions — backend supplies what actions are currently
  // permitted. The frontend renders buttons only for available actions.
  // The frontend never decides whether an action is permitted.
  availableActions: string[]
  deliveryAddress: Address
  lineItems: OrderLineItem[]
  // Optional — only present for users with financial visibility
  financials?: OrderFinancials
}
