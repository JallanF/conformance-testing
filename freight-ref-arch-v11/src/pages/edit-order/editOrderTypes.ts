// =============================================================================
// WHAT: Edit-order request payload (page-owned write contract)
// ROLE: The body sent to the save-order endpoint from the edit-order page.
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   A request payload is a contract the server must understand, but a
//   PAGE-OWNED one: this shape is used only by the edit-order page's save
//   mutation. Per the page-first rule it lives with its page, not in
//   shared/contracts/. It composes a shared contract type (AddressFields)
//   from shared/contracts/.
//
//   deliveryAddress is AddressFields — the VALUES only. The client never
//   sends addressId/label; the server owns record identity (see
//   shared/contracts/addressContracts.ts).
// =============================================================================

import type { AddressFields } from '@/shared/contracts/addressContracts'

// A write payload carries ONLY what the client legitimately authors —
// references (ids), quantities, and values the user genuinely typed. It never
// sends data the server derives (customerName, productName) or must not trust
// (unitPrice). See cc26 / Business Logic Ownership.
export interface SaveOrderPayload {
  customerId: string                                             // reference — server derives the name
  deliveryAddress: AddressFields                                 // values the user typed
  lineItems: Array<{ productId: string; quantity: number }>      // reference + quantity; server prices it
}
