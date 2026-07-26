import * as React from 'react'
import {
  Button,
  Dialog,
  DialogPortal,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from 'sfi-crossings-ds'
import { BanIcon, CopyIcon, EyeIcon, FileDownIcon } from 'lucide-react'

// Portal trap (see Tooltip.tsx): the menu content portals internally, so a
// non-modal Dialog portal with `container` keeps it inside the dark-scoped
// story root — without it the open menu renders on light :root tokens.
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

// Primary story: row-actions menu on a shipment row, rendered open.
export function RowActions() {
  return (
    <DarkPortalScope>
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        Row actions
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ width: 224 }}>
        {/* Vendor DropdownMenuLabel wraps Base UI GroupLabel — must sit
            inside a DropdownMenuGroup (or RadioGroup) */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>SFI-2026-0041</DropdownMenuLabel>
          <DropdownMenuItem>
            <EyeIcon />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileDownIcon />
            Download waybill
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CopyIcon />
            Copy shipment ID
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <BanIcon />
          Cancel booking
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </DarkPortalScope>
  )
}

// Checkbox + radio items: shipment-board view options.
export function ViewOptions() {
  return (
    <DarkPortalScope>
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        View options
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ width: 208 }}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked>Lane</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked>Carrier</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Customs status</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* RadioGroup provides group context, so the label lives inside it */}
        <DropdownMenuRadioGroup value="eta">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioItem value="eta">ETA</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="departure">Departure</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    </DarkPortalScope>
  )
}
