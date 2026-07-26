import { ToggleGroup, ToggleGroupItem } from 'sfi-crossings-ds'

// Single-select lane direction picker: exactly one item pressed.
export function LaneDirectionSingle() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'calc(var(--spacing) * 2)',
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          fontSize: 'var(--onyx-font-size-small)',
          color: 'var(--muted-foreground)',
        }}
      >
        Lane direction
      </span>
      <ToggleGroup variant="outline" spacing={0} defaultValue={['southbound']}>
        <ToggleGroupItem value="southbound">CA → US</ToggleGroupItem>
        <ToggleGroupItem value="northbound">US → CA</ToggleGroupItem>
        <ToggleGroupItem value="all">All lanes</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

// Multiple-select status filters: two items pressed at once.
export function StatusFiltersMultiple() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'calc(var(--spacing) * 2)',
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          fontSize: 'var(--onyx-font-size-small)',
          color: 'var(--muted-foreground)',
        }}
      >
        Show statuses
      </span>
      <ToggleGroup
        multiple
        variant="outline"
        defaultValue={['in-transit', 'customs-hold']}
      >
        <ToggleGroupItem value="in-transit">In transit</ToggleGroupItem>
        <ToggleGroupItem value="customs-hold">Customs hold</ToggleGroupItem>
        <ToggleGroupItem value="delivered">Delivered</ToggleGroupItem>
        <ToggleGroupItem value="cancelled" disabled>
          Cancelled
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
