import * as React from 'react'
import {
  Badge,
  Dialog,
  DialogPortal,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Separator,
} from 'sfi-crossings-ds'

// Portal trap (see Tooltip.tsx): HoverCardContent portals internally, so a
// non-modal Dialog portal with `container` provides the parent portal node;
// the popup chains to it via Base UI's parent-portal context, keeping the
// card inside the dark-scoped story root.
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

const stat: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  padding: '3px 0',
}
const num: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
}

// Hovering a carrier name in a shipment row reveals a profile card.
// Rendered open via defaultOpen; hover cannot be captured statically.
export function CarrierProfileCard() {
  return (
    <DarkPortalScope>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 48,
          fontSize: 14,
        }}
      >
        <HoverCard defaultOpen>
          <span style={{ color: 'var(--muted-foreground)' }}>
            SFI-2026-0041 · carrier{' '}
            <HoverCardTrigger
              href="#"
              style={{
                color: 'var(--foreground)',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Maple Line Freight
            </HoverCardTrigger>
          </span>
          <HoverCardContent style={{ width: 280 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 500 }}>Maple Line Freight</div>
              <Badge variant="secondary">Preferred</Badge>
            </div>
            <div style={stat}>
              <span style={{ color: 'var(--muted-foreground)' }}>On-time rate</span>
              <span style={num}>96.4%</span>
            </div>
            <div style={stat}>
              <span style={{ color: 'var(--muted-foreground)' }}>Loads this quarter</span>
              <span style={num}>128</span>
            </div>
            <Separator style={{ margin: '8px 0' }} />
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              Lanes: Toronto → Detroit · Toronto → Buffalo · Windsor → Chicago
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </DarkPortalScope>
  )
}
