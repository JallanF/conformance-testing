import * as React from 'react'
import {
  Dialog,
  DialogPortal,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from 'sfi-crossings-ds'

// Portal trap (see Tooltip.tsx): the select popup portals internally, so a
// non-modal Dialog portal with `container` keeps it inside the dark-scoped
// story root — without it the open list renders on light :root tokens.
function DarkPortalScope({ children }: { children: React.ReactNode }) {
  const [scope, setScope] = React.useState<HTMLElement | null>(null)
  return (
    <div ref={setScope}>
      <Dialog defaultOpen modal={false}>
        <DialogPortal container={scope}>{children}</DialogPortal>
      </Dialog>
    </div>
  )
}

const serviceLevels = [
  { value: 'standard-ltl', label: 'Standard LTL' },
  { value: 'expedited', label: 'Expedited' },
  { value: 'full-truckload', label: 'Full truckload' },
]

const terminals = [
  { value: 'tor-01', label: 'Toronto — Gateway Yard' },
  { value: 'det-02', label: 'Detroit — Rougemere' },
  { value: 'buf-03', label: 'Buffalo — Black Rock' },
]

const terminalsWithPlaceholder = [
  { value: null, label: 'Select origin terminal' },
  ...terminals,
]

// Primary story: service-level picker, rendered open with a selection.
// Top padding leaves room for the popup, which aligns the selected item
// over the trigger and extends upward.
export function ServiceLevel() {
  return (
    <DarkPortalScope>
      <div style={{ paddingTop: 150 }}>
        <Select items={serviceLevels} defaultValue="expedited" defaultOpen>
          <SelectTrigger style={{ width: 240 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Service level</SelectLabel>
              {serviceLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </DarkPortalScope>
  )
}

// Closed trigger with a committed value.
export function OriginTerminal() {
  return (
    <Select items={terminals} defaultValue="tor-01">
      <SelectTrigger style={{ width: 260 }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {terminals.map((terminal) => (
            <SelectItem key={terminal.value} value={terminal.value}>
              {terminal.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

// Closed trigger in its empty (placeholder) state.
export function Placeholder() {
  return (
    <Select items={terminalsWithPlaceholder} defaultValue={null}>
      <SelectTrigger style={{ width: 260 }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {terminals.map((terminal) => (
            <SelectItem key={terminal.value} value={terminal.value}>
              {terminal.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
