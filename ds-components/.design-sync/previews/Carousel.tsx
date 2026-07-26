import type * as React from 'react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from 'sfi-crossings-ds'

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
}
const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 'calc(var(--spacing) * 4)',
  padding: 'calc(var(--spacing) * 1) 0',
  fontSize: 'var(--onyx-font-size-small)',
}

const lanes = [
  {
    id: 'SFI-2026-0041',
    lane: 'Toronto → Detroit',
    status: <Badge variant="secondary">In transit</Badge>,
    eta: 'Jul 24, 14:00 EDT',
    carrier: 'Maple Line Freight',
    crossing: 'Ambassador Bridge',
  },
  {
    id: 'SFI-2026-0038',
    lane: 'Montréal → Buffalo',
    status: <Badge variant="destructive">Customs hold</Badge>,
    eta: 'Jul 25, 09:30 EDT',
    carrier: 'St. Lawrence Carriers',
    crossing: 'Peace Bridge',
  },
  {
    id: 'SFI-2026-0035',
    lane: 'Windsor → Chicago',
    status: <Badge variant="outline">Delivered</Badge>,
    eta: 'Jul 22, 16:45 CDT',
    carrier: 'Great Lakes Haulage',
    crossing: 'Blue Water Bridge',
  },
]

// Whole-card story: a strip of active-shipment spotlight cards with the
// prev/next controls visible. Explicit widths everywhere — the capture page
// never fires ResizeObserver/rAF, so nothing may depend on measurement.
export function ActiveShipmentSpotlights() {
  return (
    <div
      style={{
        padding: '0 calc(var(--spacing) * 14)',
        minHeight: 500,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Carousel style={{ width: 560 }}>
        <CarouselContent>
          {lanes.map((s) => (
            <CarouselItem key={s.id} style={{ flexBasis: 300 }}>
              <Card>
                <CardHeader>
                  <CardTitle style={mono}>{s.id}</CardTitle>
                  <CardDescription>{s.lane}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      paddingBottom: 'calc(var(--spacing) * 2)',
                    }}
                  >
                    {s.status}
                  </div>
                  <div style={row}>
                    <span>ETA</span>
                    <span style={mono}>{s.eta}</span>
                  </div>
                  <div style={row}>
                    <span>Carrier</span>
                    <span>{s.carrier}</span>
                  </div>
                  <div style={row}>
                    <span>Crossing</span>
                    <span>{s.crossing}</span>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
