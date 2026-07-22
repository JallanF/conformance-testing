// =============================================================================
// WHAT: Session-expiry bridge
// ROLE: Lets apiFetch() (a plain function) tell AuthProvider (a React
//       component) that the backend rejected the session, so the session can
//       be ended cleanly: user cleared, token cleared, cache cleared, and the
//       user redirected to login.
//
// ARCHITECTURE NOTE:
//   Same bridge pattern as tokenStore.ts, in the opposite direction:
//     tokenStore    — AuthProvider WRITES, apiFetch READS  (the credential)
//     sessionExpiry — AuthProvider LISTENS, apiFetch SIGNALS (the expiry)
//   apiFetch() cannot call useAuth() — plain functions cannot access React
//   context — so AuthProvider registers a handler here at mount, and
//   apiFetch() invokes it when a request comes back 401 ('unauthenticated').
//
//   No redirect code is needed anywhere: the handler ends the session, which
//   sets AuthContext's user to null — and ProtectedRoute already redirects to
//   /login whenever user is null. The redirect falls out of existing logic.
//
// REFERENCE-STAGE SEAM: dormant under stubs (they never return 401). This is
//   the seam where a real IdP integration decides its 401 policy — the simple
//   version here (end the session) may be upgraded to refresh-and-retry inside
//   apiFetch/getAccessToken without any caller changing. See cc27 / Backend
//   Interaction / Auth Boundary and Reference-stage Seams.
//
// SEE ALSO:
//   app/apiFetch.ts      — calls notifySessionExpired() on a 401 response
//   app/AuthProvider.tsx — registers the handler that ends the session
// =============================================================================

// The handler AuthProvider registers at mount. Null until the app has mounted.
let sessionExpiredHandler: (() => void) | null = null

// Called by AuthProvider (once, at mount) to say what should happen when the
// session expires.
export function registerSessionExpiredHandler(handler: () => void): void {
  sessionExpiredHandler = handler
}

// Called by apiFetch() when the backend answers 401. Safe to call before the
// app mounts (no handler registered yet → nothing happens).
export function notifySessionExpired(): void {
  sessionExpiredHandler?.()
}
