import * as React from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from 'sfi-crossings-ds'
import {
  ArrowRightIcon,
  CopyIcon,
  FileDownIcon,
  PackagePlusIcon,
} from 'lucide-react'

const frame: React.CSSProperties = {
  width: 420,
  border: '1px solid var(--border)',
  borderRadius: 12,
}

// Command palette with shipment search results and quick actions.
export function ShipmentPalette() {
  return (
    <Command style={frame}>
      <CommandInput placeholder="Search shipments and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Shipments">
          <CommandItem>
            <ArrowRightIcon />
            Go to SFI-2026-0041
          </CommandItem>
          <CommandItem>
            <ArrowRightIcon />
            Go to SFI-2026-0038
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem>
            <PackagePlusIcon />
            Book a shipment
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <FileDownIcon />
            Download waybill
          </CommandItem>
          <CommandItem>
            <CopyIcon />
            Copy shipment ID
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

// Query that matches nothing: the palette's empty state.
export function NoResults() {
  const [query, setQuery] = React.useState('SFI-2026-9999')
  return (
    <Command style={frame}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search shipments and actions..."
      />
      <CommandList>
        <CommandEmpty>
          No shipments match &ldquo;SFI-2026-9999&rdquo;. Check the ID or book
          a new shipment.
        </CommandEmpty>
        <CommandGroup heading="Shipments">
          <CommandItem>Go to SFI-2026-0041</CommandItem>
          <CommandItem>Go to SFI-2026-0038</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
