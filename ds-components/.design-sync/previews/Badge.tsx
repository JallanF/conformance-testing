import { Badge } from 'sfi-crossings-ds'
import { TriangleAlert, Truck } from 'lucide-react'

// Full variant axis; amber (default) appears exactly once, destructive only
// as a genuine problem status.
export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge>Priority</Badge>
      <Badge variant="secondary">In transit</Badge>
      <Badge variant="destructive">Customs hold</Badge>
      <Badge variant="outline">Delivered</Badge>
      <Badge variant="ghost">Draft</Badge>
      <Badge variant="link">SFI-2026-0041</Badge>
    </div>
  )
}

export function WithIcons() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge variant="secondary">
        <Truck data-icon="inline-start" />
        In transit
      </Badge>
      <Badge variant="destructive">
        <TriangleAlert data-icon="inline-start" />
        Customs hold
      </Badge>
    </div>
  )
}

const shipments = [
  { id: 'SFI-2026-0041', route: 'Toronto → Detroit', badge: <Badge variant="secondary">In transit</Badge> },
  { id: 'SFI-2026-0038', route: 'Montréal → Buffalo', badge: <Badge variant="destructive">Customs hold</Badge> },
  { id: 'SFI-2026-0035', route: 'Windsor → Chicago', badge: <Badge variant="outline">Delivered</Badge> },
]

export function InShipmentList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      {shipments.map((s) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{s.id}</span>
          <span style={{ color: 'var(--color-muted-foreground)', fontSize: 13, flex: 1 }}>
            {s.route}
          </span>
          {s.badge}
        </div>
      ))}
    </div>
  )
}
