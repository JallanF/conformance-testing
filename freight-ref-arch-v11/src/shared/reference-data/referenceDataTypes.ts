// =============================================================================
// WHAT: Reference data types
// ROLE: Types for genuine reference data — domain-neutral lookup values with a
//       standardised shape (id + value + optional description).
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   Reference data is domain-neutral lookup data (service levels, countries,
//   statuses, …). It shares ONE standardised shape rather than a per-lookup
//   type, which avoids an explosion of near-identical reference-data types.
//   Domain concepts must NOT appear here — the moment a field like unitPrice
//   is needed, the thing is a domain entity (see shared/contracts/), not
//   reference data.
//
//   Descriptive aliases keep call sites readable while sharing the base shape:
//   `type ServiceLevel = ReferenceItem` reads by name yet stays standardised.
// =============================================================================

export interface ReferenceItem {
  id: string
  value: string
  description?: string
}

// A shipping service level (Standard / Express / Overnight).
export type ServiceLevel = ReferenceItem
