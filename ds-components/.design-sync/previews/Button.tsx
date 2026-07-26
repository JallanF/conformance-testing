import { Button } from 'sfi-crossings-ds'

// Emphasis doctrine: one primary (amber) action per view; this card is a
// specimen sheet, so every variant appears once for reference.
export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button>Book shipment</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="outline">Download waybill</Button>
      <Button variant="ghost">View details</Button>
      <Button variant="link">Track shipment</Button>
      <Button variant="destructive">Cancel booking</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="xs">Copy ID</Button>
      <Button size="sm">Add stop</Button>
      <Button size="default">Request quote</Button>
      <Button size="lg">Confirm booking</Button>
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button disabled>Book shipment</Button>
      <Button variant="outline" disabled>Download waybill</Button>
    </div>
  )
}
