// =============================================================================
// WHAT: Application HTTP gateway
// ROLE: The single function through which ALL backend API calls pass.
//       Handles authentication headers, common request config, and converts
//       transport failures into the application's own ApiError contract.
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction):
//   The hook layer calls apiFetch(). TanStack Query calls the hook.
//   Pages call hooks. Pages never call apiFetch() directly.
//
//   Responsibility allocation:
//     apiFetch()       → auth headers, common config, error conversion
//     TanStack Query   → caching, background refetch, loading/error state
//     Hook layer       → DTO shaping, business error handling
//     Page layer       → user-facing error messaging via toast / PageMessage
//
// ERROR CONTRACT — ApiError (kind + status):
//   apiFetch() never lets a raw HTTP status or fetch() failure escape upward.
//   It throws ApiError, whose `kind` is a small APPLICATION-OWNED vocabulary
//   ('unauthenticated', 'forbidden', 'validation', …) mapped from the HTTP
//   status HERE and nowhere else. Hooks and pages branch on `kind` and stay
//   transport-agnostic; `status` is carried only for logging and debugging.
//   This keeps HTTP knowledge encapsulated in this one file — the same
//   discipline as the auth header and the stub switch.
//
// STUB SWITCH — THE SINGLE SEAM:
//   This file contains the ONE place in the entire application that knows
//   stubs exist: the USE_STUBS branch below. When USE_STUBS is true, calls
//   are routed to the local stub transport. When false, apiFetch() makes a
//   real HTTP request to the backend.
//
//   Nothing else in the codebase references stubs. Every hook, page and
//   component calls apiFetch() with a REST path and is completely unaware
//   of whether it is talking to stubs or a real server.
//
//   To move from stubs to a real backend: set VITE_USE_STUBS=false (or remove
//   it). No other file changes. The stub files can remain in the codebase,
//   dormant.
//
//   NOTE: stub errors are plain Error objects (they represent business
//   failures like "Order not found"); ApiError describes the real HTTP path.
//   Nothing above this layer branches on ApiError in stub mode, so the
//   difference is invisible until the real backend arrives.
//
// SEE ALSO:
//   app/tokenStore.ts        — provides the auth token
//   app/sessionExpiry.ts     — notified here when a request returns 401
//   stubs/apiFetchStubs.ts   — the stub transport (path → stub dispatcher)
//   stubs/stubsApi.ts        — the stub implementations
// =============================================================================

import { getAccessToken } from './tokenStore'
import { notifySessionExpired } from './sessionExpiry'
// REFERENCE-STAGE SEAM: the stub transport is imported statically so the app
// runs out of the box. In production set VITE_USE_STUBS=false; the dead branch
// below is then tree-shaken. See cc27 / Backend Interaction / Auth Boundary
// and Reference-stage Seams.
import { apiFetchStubs } from '@/stubs/apiFetchStubs'

// THE SINGLE STUB FLAG.
// Defaults to true (stub mode) unless VITE_USE_STUBS is explicitly 'false'.
// Set VITE_USE_STUBS=false in the environment to talk to the real backend.
const USE_STUBS = import.meta.env.VITE_USE_STUBS !== 'false'

// Base URL for the real backend. Unused in stub mode. In production, set via:
//   VITE_API_BASE_URL=https://api.freightos.com
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

// --- Error contract ----------------------------------------------------------

// The application's own error vocabulary. Hooks and pages branch on these —
// never on raw HTTP status codes, which are known only inside this file.
export type ApiErrorKind =
  | 'unauthenticated'   // 401 — session missing or expired
  | 'forbidden'         // 403 — authenticated, but not permitted
  | 'notFound'          // 404 — the resource does not exist
  | 'validation'        // 400 / 409 / 422 — the request was rejected as invalid
  | 'server'            // 5xx and anything unexpected — the backend failed
  | 'network'           // fetch() itself failed — server unreachable

// Thrown by apiFetch() for every failed request on the real HTTP path.
// `kind` drives behaviour; `status` (0 when there was no HTTP response)
// exists only for logging and debugging.
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number

  constructor(kind: ApiErrorKind, status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

// The ONLY place in the application that interprets an HTTP status code.
function apiErrorKindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthenticated'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 400 || status === 409 || status === 422) return 'validation'
  return 'server'
}

// --- The gateway --------------------------------------------------------------

// PATTERN: Single HTTP gateway
// All API calls in the application flow through this function.
// This ensures authentication, headers and error handling are consistent
// across every request — no hook can accidentally bypass them.
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  // THE SINGLE STUB SEAM.
  // In stub mode, route to the local stub transport and return early.
  // Everything below this line is the real production HTTP path.
  if (USE_STUBS) {
    return apiFetchStubs<T>(path, options)
  }

  // Read the credential through the async auth seam (see tokenStore.ts / getAccessToken).
  const token = await getAccessToken()

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }

  // Content-Type describes a request BODY — only send it when there is one.
  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  // Attach the bearer token if the user is authenticated.
  // The backend validates this on every request.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // A failed fetch() (server unreachable, DNS failure, offline) never returns
  // a response at all — convert it to the 'network' kind, status 0.
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError('network', 0, 'Could not reach the server. Please check your connection and try again.')
  }

  // Convert HTTP error responses into the ApiError contract.
  // The hook layer catches these and exposes them via the standard
  // hook interface: { isError, error }.
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    const kind = apiErrorKindFromStatus(response.status)

    // REFERENCE-STAGE: session expiry. A 401 means the session is no longer
    // valid — tell AuthProvider (via the sessionExpiry bridge) so it can end
    // the session cleanly. Dormant under stubs (they never return 401).
    // Under a real IdP this same seam may instead refresh-and-retry before
    // giving up — no caller changes either way. See app/sessionExpiry.ts.
    if (kind === 'unauthenticated') {
      notifySessionExpired()
    }

    throw new ApiError(kind, response.status, message || `Request failed: ${response.status}`)
  }

  // Handle 204 No Content (common for mutations like approve, cancel)
  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}
