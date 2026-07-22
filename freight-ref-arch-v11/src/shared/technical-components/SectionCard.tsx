// =============================================================================
// WHAT: SectionCard — reusable Technical Component
// ROLE: The standard visual card every page section sits in: a titled card
//       with optional hint text under the title. Business Components render
//       their content inside it.
//
// WHY A COMPONENT (cc27 / Styling):
//   Replaces the legacy `.section` / `.section__title` classes. Under
//   utility-first styling the reuse mechanism is a React component; this one
//   composes the ui/card vendor-zone component, so every section shares the
//   card look with the rest of the application (login card, grids).
//
// TECHNICAL COMPONENT: pure presentational wrapper. No state, no logic.
// =============================================================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SectionCardProps {
  title: string
  // Optional secondary line under the title (e.g. an explanatory hint).
  hint?: string
  // Optional content rendered at the right of the title row (e.g. a badge).
  titleAside?: React.ReactNode
  children: React.ReactNode
}

export function SectionCard({ title, hint, titleAside, children }: SectionCardProps) {
  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {title}
          {titleAside}
        </CardTitle>
        {hint && <CardDescription>{hint}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
