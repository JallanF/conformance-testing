import type * as React from 'react'
import { ChevronsUpDownIcon, CircleCheckIcon } from 'lucide-react'
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'sfi-crossings-ds'

const panel: React.CSSProperties = {
  width: 440,
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
}
const header: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'calc(var(--spacing) * 3)',
  padding: 'calc(var(--spacing) * 3) calc(var(--spacing) * 4)',
}
const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 'calc(var(--spacing) * 6)',
  padding: 'calc(var(--spacing) * 1.5) 0',
}
const mono: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
}

// Expanded section of a shipment record: defaultOpen so the panel content
// is visible in the capture.
export function CustomsDocumentationOpen() {
  return (
    <div style={panel}>
      <Collapsible defaultOpen>
        <div style={header}>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-medium)' as any }}>
              Customs &amp; documentation
            </div>
            <div
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 'var(--onyx-font-size-small)',
              }}
            >
              SFI-2026-0041 · Toronto → Detroit
            </div>
          </div>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Toggle customs section"
              />
            }
          >
            <ChevronsUpDownIcon />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding:
                'calc(var(--spacing) * 3) calc(var(--spacing) * 4)',
              fontSize: 'var(--onyx-font-size-small)',
            }}
          >
            <div style={row}>
              <span>PARS number</span>
              <span style={mono}>#7364-2201</span>
            </div>
            <div style={row}>
              <span>Broker</span>
              <span>Great Lakes Customs Ltd.</span>
            </div>
            <div style={row}>
              <span>Crossing</span>
              <span>Ambassador Bridge</span>
            </div>
            <div style={{ ...row, alignItems: 'center' }}>
              <span>Clearance</span>
              <Badge variant="outline">
                <CircleCheckIcon data-icon="inline-start" />
                Cleared
              </Badge>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// Collapsed state: only the trigger row shows, inviting expansion.
export function EarlierMilestonesCollapsed() {
  return (
    <div style={panel}>
      <Collapsible>
        <div style={header}>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-medium)' as any }}>
              Earlier milestones
            </div>
            <div
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 'var(--onyx-font-size-small)',
              }}
            >
              12 events before the border crossing
            </div>
          </div>
          <CollapsibleTrigger
            render={<Button variant="outline" size="sm" />}
          >
            <ChevronsUpDownIcon />
            Show
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding:
                'calc(var(--spacing) * 3) calc(var(--spacing) * 4)',
              fontSize: 'var(--onyx-font-size-small)',
            }}
          >
            Departed Etobicoke terminal · Jul 22, 06:10 EDT
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
