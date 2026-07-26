import * as React from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  Dialog,
  DialogPortal,
} from 'sfi-crossings-ds'

// Portal trap (see Tooltip.tsx): ComboboxContent portals internally, so a
// non-modal Dialog portal with `container` provides the parent portal node;
// the popup chains to it via Base UI's parent-portal context, keeping the
// open list inside the dark-scoped story root.
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

const carriers = [
  'Maple Line Freight',
  'Great Lakes Cartage',
  'Huron Freightways',
  'Border City Transport',
  'Ontario Overland',
]

// Carrier picker rendered open with a committed selection; the popup opens
// below the input, so the story keeps its content near the top of the card.
export function CarrierPicker() {
  return (
    <DarkPortalScope>
      <div style={{ paddingTop: 24, maxWidth: 320 }}>
        <div
          style={{
            fontSize: 13,
            color: 'var(--muted-foreground)',
            marginBottom: 6,
          }}
        >
          Carrier for SFI-2026-0041
        </div>
        <Combobox items={carriers} defaultValue="Maple Line Freight" defaultOpen>
          <ComboboxInput placeholder="Search carriers" style={{ width: 300 }} />
          <ComboboxContent>
            <ComboboxEmpty>No carriers found.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxLabel>Approved carriers</ComboboxLabel>
                {carriers.map((carrier) => (
                  <ComboboxItem key={carrier} value={carrier}>
                    {carrier}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </DarkPortalScope>
  )
}
