import * as React from 'react'
import {
  Button,
  Dialog,
  DialogPortal,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from 'sfi-crossings-ds'

// Portal trap (see Dialog.tsx): Popover does not export its Portal part, so a
// non-modal Dialog portal with `container` provides the parent portal node;
// PopoverContent's internal portal chains to it via Base UI's parent-portal
// context, keeping the panel inside the dark-scoped story root.
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

export function TrackingFreshness() {
  return (
    <DarkPortalScope>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <Popover defaultOpen>
          <PopoverTrigger render={<Button variant="outline" size="sm" />}>
            Tracking status
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Tracking updated 2 min ago</PopoverTitle>
              <PopoverDescription>
                Position reported by the carrier ELD near Woodstock, ON,
                westbound on Highway 401.
              </PopoverDescription>
            </PopoverHeader>
            <div
              style={{
                fontSize: 12,
                color: 'var(--muted-foreground)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Next refresh 09:46 EDT · source: Maple Line ELD
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </DarkPortalScope>
  )
}
