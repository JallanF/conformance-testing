import * as React from 'react'
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogPortal,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'sfi-crossings-ds'

// Portal trap (see Tooltip.tsx): Sheet does not export its Portal part
// (SheetContent portals internally), so a non-modal Dialog portal with
// `container` provides the parent portal node; SheetContent's internal portal
// chains to it via Base UI's parent-portal context, keeping the panel inside
// the dark-scoped story root.
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

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 24,
  padding: '6px 0',
}
const num: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
}

export function ShipmentDetailsPanel() {
  return (
    <DarkPortalScope>
      {/* Page context the panel slides over */}
      <Card style={{ maxWidth: 420 }}>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>4 active · 1 clearing customs</CardDescription>
        </CardHeader>
      </Card>
      <Sheet defaultOpen>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>SFI-2026-0041</SheetTitle>
            <SheetDescription>Toronto → Detroit · departed 2 h ago</SheetDescription>
            <Badge variant="secondary" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
              In transit
            </Badge>
          </SheetHeader>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
            <div style={row}>
              <span>Carrier</span>
              <span>Maple Line Freight</span>
            </div>
            <Separator style={{ margin: '8px 0' }} />
            <div style={row}>
              <span>Weight</span>
              <span style={num}>1,240 kg</span>
            </div>
            <div style={row}>
              <span>Declared value</span>
              <span style={num}>$4,120.00</span>
            </div>
            <Separator style={{ margin: '8px 0' }} />
            <div style={row}>
              <span>Border crossing</span>
              <span>Ambassador Bridge</span>
            </div>
            <div style={row}>
              <span>ETA</span>
              <span style={num}>Jul 24, 14:00 EDT</span>
            </div>
          </div>
          {/* Row direction keeps the footer inside the card's cropped height */}
          <SheetFooter style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button variant="outline">Download waybill</Button>
            <Button>View full shipment</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DarkPortalScope>
  )
}

export function TriggerClosed() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        Shipment details
      </SheetTrigger>
    </Sheet>
  )
}
