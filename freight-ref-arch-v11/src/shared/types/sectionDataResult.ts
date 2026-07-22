// =============================================================================
// WHAT: SectionDataResult — the result type of every getData() ref contract
// ROLE: The shape every editing Business Component returns when the page
//       orchestration hook pulls its data (cc27 / Screen Composition /
//       Business Component Ref Contract).
//
// TYPESCRIPT NOTE — DISCRIMINATED UNION:
//   The two shapes are LINKED by isValid. Once calling code checks isValid,
//   TypeScript knows which shape it holds:
//     if (!result.isValid) return        // from here on…
//     result.data.customerId             // …data is KNOWN to be present.
//   Without this union, every save flow needed "result.data!" — a non-null
//   assertion that tells the compiler "trust me" instead of proving it.
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   Client-only (never crosses the wire), used by every page with editing
//   sections — so it lives in shared/types/ by the page-first rule.
// =============================================================================

export type SectionDataResult<TData> =
  | { isValid: true;  data: TData }   // validation passed — data is present
  | { isValid: false; data: null }    // validation failed — data is null
