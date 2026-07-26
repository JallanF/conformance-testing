import type * as React from 'react'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
  Label,
  Switch,
} from 'sfi-crossings-ds'

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }

// Checked + unchecked + disabled; the single checked switch is the one amber
// element in this composition.
export function States() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={row}>
        <Switch id="sw-alerts" defaultChecked />
        <Label htmlFor="sw-alerts">Customs clearance alerts</Label>
      </div>
      <div style={row}>
        <Switch id="sw-copies" />
        <Label htmlFor="sw-copies">Email waybill copies to shipper</Label>
      </div>
      <div style={row}>
        <Switch id="sw-invoicing" disabled />
        <Label htmlFor="sw-invoicing">Auto-invoicing (requires billing setup)</Label>
      </div>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <div style={row}>
        <Switch id="sw-gps" defaultChecked />
        <Label htmlFor="sw-gps">Live GPS tracking</Label>
      </div>
      <div style={row}>
        <Switch id="sw-toll" size="sm" />
        <Label htmlFor="sw-toll">Avoid toll routes</Label>
      </div>
    </div>
  )
}

export function InFieldRow() {
  return (
    <Field orientation="horizontal" style={{ maxWidth: 420 }}>
      <FieldContent>
        <FieldTitle>Auto-file eManifest</FieldTitle>
        <FieldDescription>
          Submit ACE and ACI entries when the waybill is finalized.
        </FieldDescription>
      </FieldContent>
      <Switch defaultChecked />
    </Field>
  )
}
