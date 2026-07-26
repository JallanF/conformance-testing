import { Calendar } from 'sfi-crossings-ds'

export function PickupDate() {
  return (
    <Calendar
      mode="single"
      month={new Date(2026, 6)}
      selected={new Date(2026, 6, 24)}
    />
  )
}

export function TransitWindow() {
  return (
    <Calendar
      mode="range"
      month={new Date(2026, 6)}
      selected={{ from: new Date(2026, 6, 20), to: new Date(2026, 6, 24) }}
    />
  )
}
