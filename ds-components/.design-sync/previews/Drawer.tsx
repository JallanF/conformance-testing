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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Separator,
} from 'sfi-crossings-ds'

// Portal trap (see Tooltip.tsx): DrawerContent portals internally, so a
// non-modal Dialog portal with `container` provides the parent portal node;
// the drawer popup chains to it via Base UI's parent-portal context, keeping
// the panel inside the dark-scoped story root.
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
  padding: '4px 0',
}
const num: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
}

// Bottom drawer (vendor default swipeDirection "down") rendered open as a
// shipment quick-view over a page-context card.
export function ShipmentQuickView() {
  return (
    <DarkPortalScope>
      {/* Page context the drawer slides over */}
      <Card style={{ maxWidth: 420 }}>
        <CardHeader>
          <CardTitle>Today&apos;s departures</CardTitle>
          <CardDescription>6 scheduled · Toronto Gateway Yard</CardDescription>
        </CardHeader>
      </Card>
      <Drawer defaultOpen showSwipeHandle>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>SFI-2026-0041</DrawerTitle>
            <DrawerDescription>
              Toronto → Detroit · Maple Line Freight
            </DrawerDescription>
          </DrawerHeader>
          <div
            style={{
              padding: '8px 16px 12px',
              maxWidth: 480,
              width: '100%',
              margin: '0 auto',
            }}
          >
            <div style={row}>
              <span>Status</span>
              <Badge variant="secondary">In transit</Badge>
            </div>
            <Separator style={{ margin: '6px 0' }} />
            <div style={row}>
              <span>Waybill</span>
              <span style={num}>WB-88213</span>
            </div>
            <div style={row}>
              <span>Border crossing</span>
              <span>Ambassador Bridge</span>
            </div>
            <div style={row}>
              <span>ETA</span>
              <span style={num}>Jul 24, 14:00 EDT</span>
            </div>
          </div>
          {/* Extra bottom padding: the fixed popup anchors a hair below the
              visible card in the capture host, which otherwise crops the
              footer buttons at the card edge. */}
          <DrawerFooter
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              maxWidth: 480,
              width: '100%',
              margin: '0 auto',
              paddingBottom: 32,
            }}
          >
            <Button variant="outline">Download waybill</Button>
            <Button>View full shipment</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </DarkPortalScope>
  )
}
