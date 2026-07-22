// =============================================================================
// WHAT: Date formatting utilities
// ROLE: Shared helpers for displaying dates consistently across the application.
//       Used in both Orders and Warehousing features.
//
// ARCHITECTURE NOTE (cc27 / Frontend Structure — shared/utils/):
//   Utilities here have no feature ownership. They are pure functions with
//   no React dependencies. Constants specific to a feature (e.g. ORDER_STATUS
//   labels) live in that feature's types/ folder, not here.
// =============================================================================

// Formats an ISO date string (YYYY-MM-DD) to a readable display format.
// Example: '2024-01-15' → '15 Jan 2024'
export function formatDate(isoDate: string): string {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Formats an ISO date string to a short format for grid columns.
// Example: '2024-01-15' → '15/01/2024'
export function formatDateShort(isoDate: string): string {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
