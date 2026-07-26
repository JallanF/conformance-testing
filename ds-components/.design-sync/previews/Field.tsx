import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Textarea,
} from 'sfi-crossings-ds'

// Labeled form fields with descriptions, grouped under a legend.
export function PickupDetails() {
  return (
    <div style={{ width: 380 }}>
      <FieldSet>
        <FieldLegend>Pickup details</FieldLegend>
        <FieldDescription>
          Where the carrier collects this shipment.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="pickup-address">Pickup address</FieldLabel>
            <Input
              id="pickup-address"
              defaultValue="4210 Dixie Rd, Mississauga ON"
            />
            <FieldDescription>
              Must match the address on the bill of lading.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="dock-notes">Dock notes</FieldLabel>
            <Textarea
              id="dock-notes"
              placeholder="Gate code, dock number, appointment window..."
            />
            <FieldDescription>
              Shared with the driver before arrival.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

// Invalid field: states what happened and what to do next.
export function ErrorState() {
  return (
    <div style={{ width: 380 }}>
      <Field data-invalid="true">
        <FieldLabel htmlFor="declared-value">Declared value</FieldLabel>
        <Input id="declared-value" aria-invalid defaultValue="-120" />
        <FieldError>
          Declared value must be greater than $0. Enter the commercial invoice
          total to continue.
        </FieldError>
      </Field>
    </div>
  )
}
