import { Button, Spinner } from 'sfi-crossings-ds'

// In-flight action sizes: 16 / 24 / 32 px.
export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Spinner />
      <Spinner style={{ width: 24, height: 24 }} />
      <Spinner style={{ width: 32, height: 32 }} />
    </div>
  )
}

// A submitting action: the button disables while the booking posts.
export function InButton() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button disabled>
        <Spinner />
        Booking shipment
      </Button>
      <Button variant="outline" disabled>
        <Spinner />
        Generating waybill
      </Button>
    </div>
  )
}

// Inline status text while rates refresh in the background.
export function InlineStatus() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        color: 'var(--muted-foreground)',
        fontSize: 14,
      }}
    >
      <Spinner />
      <span>Refreshing spot rates…</span>
    </div>
  )
}
