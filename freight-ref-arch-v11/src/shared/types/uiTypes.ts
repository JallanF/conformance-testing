// =============================================================================
// WHAT: Client-only UI types
// ROLE: Types for UI concerns that never cross the wire. A PageMessage is the
//       banner an orchestration hook shows on a page (success/error/etc.).
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   These are NOT contracts — they are never sent to or received from the
//   backend. Client-only types live in shared/types/, kept separate from the
//   DTOs in shared/contracts/. Placed here (rather than in a page) by the
//   page-first rule: PageMessage is used by many pages' orchestration hooks.
// =============================================================================

export type MessageType = 'success' | 'error' | 'warning' | 'info'

export interface PageMessage {
  type: MessageType
  text: string
}
