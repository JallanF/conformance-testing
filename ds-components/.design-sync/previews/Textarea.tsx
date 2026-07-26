import type * as React from 'react'
import { Field, FieldDescription, FieldLabel, Textarea } from 'sfi-crossings-ds'

const col: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  maxWidth: 420,
}

export function States() {
  return (
    <div style={col}>
      <Field>
        <FieldLabel htmlFor="ta-remarks">Customs remarks</FieldLabel>
        <Textarea
          id="ta-remarks"
          defaultValue={
            'Two pallets consolidated at the Mississauga hub. CUSMA certificate of origin on file with the broker.'
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="ta-handling">Handling instructions</FieldLabel>
        <Textarea
          id="ta-handling"
          placeholder="e.g. Dock 4 delivery, liftgate required"
        />
      </Field>
      <Field data-disabled="true">
        <FieldLabel htmlFor="ta-inspection">Inspection notes</FieldLabel>
        <Textarea
          id="ta-inspection"
          disabled
          defaultValue="Sealed at secondary inspection — contact the CBSA officer before reopening."
        />
      </Field>
    </div>
  )
}

export function WithDescription() {
  return (
    <Field style={{ maxWidth: 420 }}>
      <FieldLabel htmlFor="ta-amendment">Reason for amendment</FieldLabel>
      <Textarea
        id="ta-amendment"
        defaultValue="Shipper corrected the piece count from 18 to 16 cartons."
      />
      <FieldDescription>
        Included in the amended eManifest sent to CBP.
      </FieldDescription>
    </Field>
  )
}
