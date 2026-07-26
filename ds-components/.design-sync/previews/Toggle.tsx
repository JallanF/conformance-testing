import { BellIcon } from 'lucide-react'
import { Toggle } from 'sfi-crossings-ds'

// Lane filter chips above the shipment board. Pressed = filter active.
export function FilterChips() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Toggle variant="outline" defaultPressed>
        CA → US only
      </Toggle>
      <Toggle variant="outline">US → CA only</Toggle>
      <Toggle variant="outline" disabled>
        Overweight loads
      </Toggle>
    </div>
  )
}

export function DefaultVariant() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Toggle defaultPressed>
        <BellIcon />
        Watch SFI-2026-0041
      </Toggle>
      <Toggle>
        <BellIcon />
        Watch SFI-2026-0043
      </Toggle>
      <Toggle disabled>
        <BellIcon />
        Watch SFI-2026-0044
      </Toggle>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Toggle variant="outline" size="sm" defaultPressed>
        Customs hold
      </Toggle>
      <Toggle variant="outline" size="default" defaultPressed>
        In transit
      </Toggle>
      <Toggle variant="outline" size="lg" defaultPressed>
        Delivered
      </Toggle>
    </div>
  )
}
