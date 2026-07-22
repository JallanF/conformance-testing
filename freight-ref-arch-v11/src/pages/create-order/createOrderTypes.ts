// =============================================================================
// WHAT: Create-order request payload (page-owned write contract)
// ROLE: The body sent to the create-order endpoint from the create-order wizard.
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   Page-owned write contract, same rationale as edit-order's SaveOrderPayload.
//   It is deliberately STANDALONE — it does NOT extend SaveOrderPayload — so a
//   create-order type never imports an edit-order type (no page→page coupling).
//   The small field overlap is intentional: create and save are different
//   endpoints with different (if overlapping) bodies. If the server later
//   generalises these into one order-write DTO, it graduates to
//   shared/contracts/.
// =============================================================================

// deliveryAddress is AddressFields — the VALUES only. The client never sends
// addressId/label; the server owns record identity (see addressContracts.ts).
import type { AddressFields } from '@/shared/contracts/addressContracts'

// A write payload carries ONLY what the client legitimately authors —
// references (ids), quantities, and values the user genuinely typed. It never
// sends data the server derives (customerName, productName) or must not trust
// (unitPrice). The server looks those up and returns them on the next read.
// See cc26 / Business Logic Ownership.
export interface CreateOrderPayload {
  customerId: string                                             // reference — server derives the name
  deliveryAddress: AddressFields                                 // values the user typed
  lineItems: Array<{ productId: string; quantity: number }>      // reference + quantity; server prices it
  carrierId: string
  serviceLevel: string
  // Delivery options the user chooses directly — client-authored booleans,
  // so they belong in the write payload (cc26 / Business Logic Ownership).
  saturdayDelivery: boolean
  notifyCustomer: boolean
}
