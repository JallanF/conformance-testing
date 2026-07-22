// =============================================================================
// WHAT: Authentication token store
// ROLE: Holds the auth token in a module-level variable so that apiFetch()
//       can read it without needing React context (which plain functions
//       cannot access).
//
// ARCHITECTURE NOTE:
//   apiFetch() is not a React hook — it is a plain async function. It cannot
//   call useContext(). This store bridges the gap: AuthProvider calls
//   setToken() / clearToken() on login/logout; apiFetch() calls
//   getAccessToken() on every request.
//
//   In production, consider httpOnly cookies (more secure, no XSS risk) or
//   a dedicated token refresh mechanism. This module-level approach is chosen
//   here for simplicity and clarity in the reference architecture.
//
// SEE ALSO:
//   app/AuthProvider.tsx — calls setToken()/clearToken() on login/logout
//   app/apiFetch.ts      — calls getAccessToken() on every API call
// =============================================================================

// REFERENCE-STAGE SEAM: the token lives only in memory, so it is lost on a page
// refresh or new tab. A production build rehydrates the session (silent renew or
// a secure cookie). See cc27 / Backend Interaction / Auth Boundary and
// Reference-stage Seams.
let authToken: string | null = null

// Called by AuthProvider when the user logs in.
export function setToken(token: string): void {
  authToken = token
}

// Called by AuthProvider when the user logs out.
export function clearToken(): void {
  authToken = null
}

// AUTH SEAM (scheme-agnostic): apiFetch reads the credential through this async
// accessor rather than a synchronous global. Today it returns the in-memory
// token immediately; under real auth (native store / external IdP / OIDC) a
// refresh of an expired token would happen HERE before returning — and because
// apiFetch already awaits it, no caller changes. With httpOnly-cookie auth this
// returns null and the browser attaches the cookie. See cc27 / Backend
// Interaction / Auth Boundary and Reference-stage Seams.
export async function getAccessToken(): Promise<string | null> {
  return authToken
}
