// =============================================================================
// WHAT: Selector contracts — slim domain-entity DTOs used to populate selectors
// ROLE: Server-mirrored shapes for choosing a Customer / Carrier / Product in a
//       dropdown. These are domain ENTITIES projected to the fields a selector
//       needs — NOT reference data.
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   Reference data is domain-neutral lookup data (e.g. countries, service
//   levels) with a standardised shape (see shared/reference-data/). The moment
//   a domain concept appears — e.g. Product.unitPrice — it is NOT reference
//   data; it's a domain entity. Customer/Carrier/Product are domain entities we
//   render as selectors, so they are contract DTOs kept at their real shapes,
//   fetched by ordinary …Query hooks (shared/data/), not …ReferenceDataQuery.
// =============================================================================

export interface Customer {
  customerId: string
  name: string
}

export interface Carrier {
  carrierId: string
  name: string
}

export interface Product {
  productId: string
  name: string
  unitPrice: number
}
