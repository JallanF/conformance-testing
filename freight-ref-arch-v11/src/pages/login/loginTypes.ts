// =============================================================================
// WHAT: Login page types (page-owned)
// ROLE: Type definitions used only by the login page.
//
// NOTE: AuthUser (the /auth/login response body, held in AuthContext) is a
//       contract type and lives in shared/contracts/authContracts.ts — it is
//       consumed by app/AuthProvider.tsx, and app/ never depends on a page
//       folder. Only the page's own form shape lives here.
// =============================================================================

// The shape of the login form fields.
export interface LoginFormValues {
  email: string
  password: string
}
