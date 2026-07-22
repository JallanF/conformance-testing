// =============================================================================
// WHAT: DetailField — reusable Technical Component
// ROLE: A single read-only label/value pair inside a DetailGrid. The value is
//       ReactNode, so callers can render text, a badge, or coloured content.
//
// Replaces the legacy `.detail-field` family (cc27 / Styling). The optional
// valueClassName lets DATA choose emphasis classes (e.g. text-warning for a
// low margin) — the data-driven class rule; the data never carries a style.
//
// TECHNICAL COMPONENT: pure presentational wrapper. No state, no logic.
// =============================================================================

import { cn } from '@/lib/utils'

interface DetailFieldProps {
  label: string
  valueClassName?: string
  children: React.ReactNode
}

export function DetailField({ label, valueClassName, children }: DetailFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className={cn('text-sm font-medium', valueClassName)}>
        {children}
      </span>
    </div>
  )
}
