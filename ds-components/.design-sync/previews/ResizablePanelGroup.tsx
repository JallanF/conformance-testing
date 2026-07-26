import type * as React from 'react'
import {
  Badge,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from 'sfi-crossings-ds'

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
}
const listItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'calc(var(--spacing) * 1)',
  padding: 'calc(var(--spacing) * 2.5) calc(var(--spacing) * 3)',
  borderBottom: '1px solid var(--border)',
  fontSize: 'var(--onyx-font-size-small)',
}
const detailRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 'calc(var(--spacing) * 6)',
  padding: 'calc(var(--spacing) * 1.5) 0',
  fontSize: 'var(--onyx-font-size-small)',
}

// Two-panel split: shipment list on the left, selected shipment detail on
// the right, with the drag handle visible between them.
export function ShipmentSplitView() {
  return (
    <div style={{ height: 280, width: '100%' }}>
      <ResizablePanelGroup
        orientation="horizontal"
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--card)',
        }}
      >
        <ResizablePanel defaultSize="36%" minSize="24%">
          <div
            style={{
              padding:
                'calc(var(--spacing) * 2.5) calc(var(--spacing) * 3)',
              borderBottom: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              fontSize: 'var(--onyx-font-size-small)',
            }}
          >
            Active shipments
          </div>
          <div style={{ ...listItem, background: 'var(--muted)' }}>
            <span style={mono}>SFI-2026-0041</span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              Toronto → Detroit
            </span>
          </div>
          <div style={listItem}>
            <span style={mono}>SFI-2026-0038</span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              Montréal → Buffalo
            </span>
          </div>
          <div style={listItem}>
            <span style={mono}>SFI-2026-0035</span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              Windsor → Chicago
            </span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="64%">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'calc(var(--spacing) * 3)',
              padding:
                'calc(var(--spacing) * 2.5) calc(var(--spacing) * 3)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ ...mono, fontSize: 'var(--onyx-font-size-regular)' }}>
              SFI-2026-0041
            </span>
            <Badge variant="secondary">In transit</Badge>
          </div>
          <div
            style={{
              padding:
                'calc(var(--spacing) * 2) calc(var(--spacing) * 3)',
            }}
          >
            <div style={detailRow}>
              <span>Lane</span>
              <span>Toronto → Detroit</span>
            </div>
            <div style={detailRow}>
              <span>Carrier</span>
              <span>Maple Line Freight</span>
            </div>
            <div style={detailRow}>
              <span>Waybill</span>
              <span style={mono}>WB-88214</span>
            </div>
            <div style={detailRow}>
              <span>Weight</span>
              <span style={mono}>1,240 kg</span>
            </div>
            <div style={detailRow}>
              <span>ETA</span>
              <span style={mono}>Jul 24, 14:00 EDT</span>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
