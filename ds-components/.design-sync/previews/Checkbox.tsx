import type * as React from 'react'
import {
  Checkbox,
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Label,
} from 'sfi-crossings-ds'

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }

// Checked + unchecked + disabled; the single checked box is the one amber
// element in this composition.
export function States() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={row}>
        <Checkbox id="cb-invoice" defaultChecked />
        <Label htmlFor="cb-invoice">Commercial invoice attached</Label>
      </div>
      <div style={row}>
        <Checkbox id="cb-packing" />
        <Label htmlFor="cb-packing">Packing list attached</Label>
      </div>
      <div style={row}>
        <Checkbox id="cb-bol" disabled />
        <Label htmlFor="cb-bol">Bill of lading (locked after pickup)</Label>
      </div>
    </div>
  )
}

export function DocumentChecklist() {
  return (
    <FieldSet style={{ maxWidth: 380 }}>
      <FieldLegend>Customs documents</FieldLegend>
      <FieldDescription>
        Required before the Ambassador Bridge crossing on Jul 24.
      </FieldDescription>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        <Field orientation="horizontal">
          <Checkbox id="doc-invoice" defaultChecked />
          <FieldLabel htmlFor="doc-invoice">Commercial invoice</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="doc-origin" />
          <FieldLabel htmlFor="doc-origin">Certificate of origin (CUSMA)</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="doc-packing" />
          <FieldLabel htmlFor="doc-packing">Packing list</FieldLabel>
        </Field>
      </div>
    </FieldSet>
  )
}
