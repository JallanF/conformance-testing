import * as React from 'react'

// Package-owned (NOT mirrored from the app). Preview/host wrapper that applies
// the dark-canonical theme exactly the way the app does: the `dark` class on an
// ancestor scopes the .dark token overrides. Embedded contexts (preview cards,
// design-host docs) fall back to light :root values without it.
export function DsDarkRoot({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="dark"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)',
        padding: 24,
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  )
}
