import { Checkbox, Input, Label } from 'sfi-crossings-ds'

// Label paired with a text input, the everyday form composition.
export function WithInput() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340 }}
    >
      <Label htmlFor="lb-waybill">Waybill number</Label>
      <Input id="lb-waybill" defaultValue="WB-88231-CA" />
    </div>
  )
}

// The disabled peer control (Checkbox carries the vendor `peer` class and
// precedes the Label in the DOM) dims the label via peer-disabled.
export function PeerDisabled() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Checkbox id="lb-hazmat" defaultChecked />
        <Label htmlFor="lb-hazmat">Hazmat declaration reviewed</Label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Checkbox id="lb-sealed" disabled />
        <Label htmlFor="lb-sealed">Trailer sealed (locked after pickup)</Label>
      </div>
    </div>
  )
}
