// =============================================================================
// WHAT: FormRow — reusable Technical Component
// ROLE: The standard responsive row of form fields: as many 220px-minimum
//       columns as fit the width. Holds Field children (ui/field).
//
// Replaces the legacy `.form-row` class (cc27 / Styling — components, not
// shared CSS classes, are the reuse mechanism under utility-first styling).
// The read-only counterpart is DetailGrid.
//
// TECHNICAL COMPONENT: pure presentational wrapper. No state, no logic.
// =============================================================================

export function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {children}
    </div>
  )
}
