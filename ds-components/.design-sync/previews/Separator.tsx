import type * as React from 'react'
import { Separator } from 'sfi-crossings-ds'

const meta: React.CSSProperties = { fontSize: 13, color: 'var(--muted-foreground)' }

// Shipment header: horizontal rule between sections, vertical rules
// between inline meta facts.
export function ShipmentMeta() {
  return (
    <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>SFI-2026-0041</div>
        <div style={meta}>Toronto, ON → Detroit, MI · Ambassador Bridge</div>
      </div>
      <Separator />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={meta}>Waybill WB-88231-CA</span>
        <Separator orientation="vertical" style={{ height: 16 }} />
        <span style={meta}>Maple Line Carriers</span>
        <Separator orientation="vertical" style={{ height: 16 }} />
        <span style={meta}>Customs cleared</span>
      </div>
    </div>
  )
}
