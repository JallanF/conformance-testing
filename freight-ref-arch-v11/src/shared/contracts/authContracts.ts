// =============================================================================
// WHAT: Auth contracts — server-mirrored DTO for the authenticated user
// ROLE: The authenticated principal returned by the login endpoint and held in
//       AuthContext (Application State) for the whole session.
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   AuthUser crosses the wire — it is the /auth/login response body — so it is
//   a contract type and lives in shared/contracts/, not shared/types/.
//
//   It also deliberately does NOT live in the login page folder: it is consumed
//   by app/AuthProvider.tsx (application infrastructure), and app/ must never
//   depend on a page folder. The login page's own form type (LoginFormValues)
//   stays page-owned in pages/login/loginTypes.ts.
// =============================================================================

import type { UserRole } from '@/shared/types/userRole'

// The authenticated user object stored in AuthContext (Application State).
// Returned by the login API and held in AuthProvider state.
export interface AuthUser {
  userId: string
  name: string
  email: string
  role: UserRole
}
