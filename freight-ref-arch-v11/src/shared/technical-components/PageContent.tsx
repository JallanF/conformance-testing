// =============================================================================
// WHAT: PageContent — reusable Technical Component
// ROLE: The standard page content wrapper: centred column, max width, padding.
//       Every page renders its content inside this shell.
//
// WHY A COMPONENT (cc27 / Styling):
//   Under utility-first styling, the reuse mechanism is a React component,
//   not a shared CSS class (official Tailwind guidance, and the RA's own
//   graduation rule: this markup appeared in a second place, so it graduated
//   to shared/). It replaces the legacy `.page-content` class as pages are
//   migrated.
//
// TECHNICAL COMPONENT: pure presentational wrapper. No state, no logic.
// =============================================================================

export function PageContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 p-6">
      {children}
    </main>
  )
}
