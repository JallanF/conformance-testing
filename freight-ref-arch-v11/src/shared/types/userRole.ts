// =============================================================================
// WHAT: UserRole — client-only application-state enum
// ROLE: The authenticated user's role. Used for DISPLAY (the TopNav role badge)
//       and, on the server side, to decide what data to send. The frontend
//       NEVER compares the role to gate visibility.
//
// ARCHITECTURE NOTE:
//   cc26 / Security and Permissions
//   cc27 / State Management / Application State
//
//   Permission decisions live on the server (cc26). The FE renders on data
//   PRESENCE (financials present → show them) and on availableActions — never
//   on role. So in the client this enum is display-only; in the stub backend it
//   drives server-side suppression, exactly as a real backend would.
//
//   The role strings mirror the backend, but this is client-side application
//   state, not a request/response body — so it is a client-only type, kept
//   separate from the DTOs in shared/contracts/.
// =============================================================================

export enum UserRole {
  Admin    = 'admin',
  Manager  = 'manager',
  Operator = 'operator',
}
