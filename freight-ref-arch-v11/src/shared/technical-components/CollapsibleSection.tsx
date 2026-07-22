// =============================================================================
// WHAT: CollapsibleSection — reusable CONTAINER Technical Component
// ROLE: A collapsible wrapper a page places AROUND a Business Component.
//       Owns one piece of UI state (open/closed) and nothing else.
//
// THE CONTAINER CASE (cc27 / Using a Component Library / the dividing line):
//   This is the container Technical Component that sits ABOVE Business
//   Components — the reverse of the usual nesting. The invariants hold
//   because it carries no business logic and owns only UI state, exactly the
//   status the RA grants DataGrid's sort state.
//
// THE ONE RULE THIS COMPONENT EXISTS TO DEMONSTRATE — keepMounted:
//   An EDITING Business Component inside a collapsing container must stay
//   MOUNTED when collapsed (cc27 / one rule to add). React clears a
//   component's state and ref when it unmounts — so if collapsing unmounted
//   the panel, the section's form state would be silently discarded and the
//   page's save would find a null ref. Base UI's `keepMounted` on the Panel
//   keeps the collapsed content in the DOM (hidden), so form state and the
//   pull-pattern ref survive collapse/expand. Read-only content has no such
//   constraint — but the rule is applied uniformly here.
//
// TECHNICAL COMPONENT: props in; owns only the open/closed UI state
//   (uncontrolled, defaultOpen).
// =============================================================================

import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface CollapsibleSectionProps {
  // The trigger-bar label. The Business Component inside renders its own
  // SectionCard title; this label names the collapsed bar.
  label: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({ label, defaultOpen = true, children }: CollapsibleSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="mb-2">
      <CollapsibleTrigger className="group/collapsible mb-2 flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ChevronDown className="size-4 -rotate-90 transition-transform group-data-[panel-open]/collapsible:rotate-0" />
        {label}
      </CollapsibleTrigger>
      {/* keepMounted: the collapsed panel stays in the DOM (hidden) so the
          Business Component inside keeps its form state and ref. */}
      <CollapsibleContent keepMounted className="data-closed:hidden">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
