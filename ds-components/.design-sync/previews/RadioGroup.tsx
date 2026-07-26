import { Label, RadioGroup, RadioGroupItem } from 'sfi-crossings-ds'

const row = { display: 'flex', alignItems: 'center', gap: 10 } as const

// Service-level chooser for a Toronto → Detroit booking. Expedited is
// selected; the air option is disabled for this lane.
export function ServiceLevel() {
  return (
    <RadioGroup defaultValue="expedited" style={{ maxWidth: 340 }}>
      <div style={row}>
        <RadioGroupItem value="standard" id="svc-standard" />
        <Label htmlFor="svc-standard">Standard LTL — 3 to 5 days</Label>
      </div>
      <div style={row}>
        <RadioGroupItem value="expedited" id="svc-expedited" />
        <Label htmlFor="svc-expedited">Expedited — next business day</Label>
      </div>
      <div style={row}>
        <RadioGroupItem value="ftl" id="svc-ftl" />
        <Label htmlFor="svc-ftl">Full truckload — dedicated trailer</Label>
      </div>
      <div style={row}>
        <RadioGroupItem value="air" id="svc-air" disabled />
        <Label htmlFor="svc-air">Air freight (unavailable on this lane)</Label>
      </div>
    </RadioGroup>
  )
}
