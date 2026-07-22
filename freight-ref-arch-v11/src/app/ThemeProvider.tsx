// =============================================================================
// WHAT: ThemeProvider — light/dark theme (Application State)
// ROLE: Owns the user's theme preference and applies it to the document.
//       The preference is client-only UI state: it never crosses the wire,
//       and it is the RA's one piece of UI state persisted across sessions
//       (localStorage) — see DECISIONS-LOG D7.
//
// HOW IT WORKS (the shadcn-standard mechanism):
//   The shadcn theme tokens in index.css are defined twice — under :root
//   (light) and under .dark. This provider adds or removes the 'dark' class
//   on <html>, which flips every token at once. 'system' follows the OS
//   preference via the prefers-color-scheme media query.
//
// ARCHITECTURE NOTE:
//   Application State, exactly like AuthContext: a React Context defined in
//   app/, read through a thin hook in shared/utility-hooks/ (useTheme).
//   It is read only by application infrastructure (the TopNav theme menu) —
//   never by Business Components, which are theme-agnostic: their Tailwind
//   classes reference semantic tokens (bg-background, text-foreground) that
//   resolve per-theme in CSS.
//
// SEE ALSO:
//   shared/utility-hooks/useTheme.ts — the accessor hook
//   app/TopNav.tsx                   — the theme menu (the only writer today)
// =============================================================================

import { createContext, useEffect, useState, type ReactNode } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'

export interface ThemeContextValue {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_STORAGE_KEY = 'freightos-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser: read the stored preference once, on first render.
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'system'
  })

  // Apply the preference to <html> whenever it changes.
  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  const setTheme = (nextTheme: ThemePreference) => {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    setThemeState(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
