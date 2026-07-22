// =============================================================================
// WHAT: Login page data hook (login mutation)
// ROLE: Wraps the login API call in a TanStack Query mutation.
//       Provides the standard mutation hook interface to the page layer.
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction):
//   Execution flow:
//     useLoginPage() → useLoginMutation() → TanStack Query → apiFetch → Backend
//
//   TanStack Query is an implementation detail. The page orchestration hook
//   calls mutate(). It does not know about useMutation or TanStack Query.
//
// STANDARD MUTATION HOOK INTERFACE (cc27 / Backend Interaction / Hook Standard Interfaces):
//   { login, isPending, isError, error, isSuccess }
//
// BACKEND CALLS:
//   Calls apiFetch(). apiFetch() is the single gateway to the backend — in
//   stub mode it routes to the local stubs, in production it makes a real
//   HTTP request. Neither this hook nor anything above it knows or cares
//   which; that switch lives entirely inside apiFetch().
// =============================================================================

import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/app/apiFetch'
import type { AuthUser } from '@/shared/contracts/authContracts'

export function useLoginMutation() {
  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      // REFERENCE-STAGE SEAM: credential POST to /auth/login. A real IdP flow
      // (e.g. OIDC Authorization Code + PKCE redirect) replaces this; the token
      // boundary (apiFetch + AuthProvider) is unaffected. See cc27 / Backend
      // Interaction / Auth Boundary and Reference-stage Seams.
      apiFetch<AuthUser>('/auth/login', { method: 'POST', body: { email, password } }),
  })

  return {
    // PATTERN: Standard mutation hook interface
    // (cc27 / Backend Interaction / Hook Standard Interfaces)
    // The page orchestration hook calls login(), not mutation.mutate().
    // This naming makes the orchestration hook code read naturally.
    login: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
