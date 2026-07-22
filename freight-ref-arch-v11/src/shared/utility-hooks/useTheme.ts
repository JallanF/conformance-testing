// =============================================================================
// WHAT: useTheme hook
// ROLE: Provides clean, safe access to ThemeContext (Application State).
//       Throws a clear error if used outside ThemeProvider (common mistake).
//
// ARCHITECTURE NOTE:
//   Mirrors useAuth exactly: the context lives in app/ (infrastructure), the
//   accessor hook lives here in shared/utility-hooks/ ("genuinely reusable
//   hooks only"). Read only by application infrastructure — today just the
//   TopNav theme menu. Business Components never read it: they are
//   theme-agnostic because their classes use semantic tokens that resolve
//   per-theme in CSS (see app/ThemeProvider.tsx).
//
// SEE ALSO:
//   app/ThemeProvider.tsx — defines ThemeContext and ThemeContextValue
// =============================================================================

import { useContext } from 'react'
import { ThemeContext } from '@/app/ThemeProvider'
import type { ThemeContextValue } from '@/app/ThemeProvider'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme() must be used within a <ThemeProvider>. Check your provider tree.')
  }
  return context
}
