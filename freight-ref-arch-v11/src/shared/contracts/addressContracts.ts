// =============================================================================
// WHAT: Address contracts — cross-feature server-mirrored DTOs
// ROLE: A postal address as exchanged with the backend. Shared because it is
//       used by both orders (delivery address) and warehousing (warehouse
//       address) — a single authoritative definition.
//
// TWO SHAPES, ONE DEFINITION (cc27 / DTO and Type Guidance):
//   AddressFields — the address VALUES (street, city, …). This is what the
//     user edits and what WRITE payloads carry. The client never sends
//     addressId or label: the server assigns its own record identity, and
//     picking a saved address in the UI only PRE-FILLS fields — what is
//     saved is the value, not a reference to the saved record.
//   Address — AddressFields plus the server-assigned identity (addressId)
//     and display label. This is what READ responses carry, and what the
//     saved-address pick-list options are keyed by.
//
//   Address extends AddressFields, so the field set is defined exactly once.
// =============================================================================

// The address values — what the user edits, and what write payloads carry.
export interface AddressFields {
  street: string
  city: string
  state: string
  postcode: string
  country: string
}

// A stored address as returned by the backend — the fields plus the
// server-assigned identity and display label.
export interface Address extends AddressFields {
  addressId: string
  label: string
}
