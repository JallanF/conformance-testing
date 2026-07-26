import type * as React from 'react'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from 'sfi-crossings-ds'

const col: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  maxWidth: 360,
}

export function States() {
  return (
    <div style={col}>
      <Field>
        <FieldLabel htmlFor="in-waybill">Waybill number</FieldLabel>
        <Input id="in-waybill" defaultValue="WB-88231-CA" />
      </Field>
      <Field>
        <FieldLabel htmlFor="in-broker">Broker reference</FieldLabel>
        <Input id="in-broker" placeholder="e.g. BRK-2231" />
      </Field>
      <Field data-disabled="true">
        <FieldLabel htmlFor="in-scac">Carrier SCAC</FieldLabel>
        <Input id="in-scac" defaultValue="SFIC" disabled />
      </Field>
    </div>
  )
}

export function WithDescription() {
  return (
    <Field style={{ maxWidth: 360 }}>
      <FieldLabel htmlFor="in-declared">Declared value (USD)</FieldLabel>
      <Input id="in-declared" inputMode="decimal" defaultValue="4,120.00" />
      <FieldDescription>
        Used to assess duty at the Windsor–Detroit crossing.
      </FieldDescription>
    </Field>
  )
}

export function Invalid() {
  return (
    <Field data-invalid="true" style={{ maxWidth: 360 }}>
      <FieldLabel htmlFor="in-hs">HS tariff code</FieldLabel>
      <Input id="in-hs" aria-invalid defaultValue="9403.2" />
      <FieldError>Enter the full 10-digit HS code.</FieldError>
    </Field>
  )
}
