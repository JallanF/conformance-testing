// =============================================================================
// WHAT: DetailGrid — reusable Technical Component
// ROLE: The standard responsive grid for read-only detail fields. Its column
//       count adapts to the width of the CONTAINER it is placed in.
//
// Replaces the legacy `.detail-grid` class (cc27 / Styling — components, not
// shared CSS classes, are the reuse mechanism under utility-first styling).
//
// CONTAINER QUERIES (cc27 / Styling — adopt-when):
//   The columns respond to THIS wrapper's width — not the viewport's — via
//   Tailwind's `@container` + `@md:` / `@xl:` variants. So the SAME DetailGrid
//   renders 3-up on a full-width page and 1-up inside a narrow dialog, with no
//   viewport breakpoints involved (the warehouse "Add Allocation" dialog shows
//   the narrow branch; the Order Info tab shows the wide one). This is the
//   RA's demonstration of the container-query pattern — for a plain "as many
//   columns as fit" grid, the `auto-fill` approach is an equally valid default;
//   container queries earn their place when the breakpoints must be discrete.
//
// TECHNICAL COMPONENT: pure presentational wrapper. No state, no logic.
// =============================================================================

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return (
    // @container establishes the query context; the grid below reads THIS
    // element's width, not the screen's. Thresholds chosen so a full-width
    // page shows 3 columns and the narrow "Add Allocation" dialog shows 1.
    <div className="@container">
      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
        {children}
      </div>
    </div>
  )
}
