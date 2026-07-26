import type * as React from 'react'
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'sfi-crossings-ds'

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 24,
  padding: '6px 0',
}
const num: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
}

export function ShipmentSummary() {
  return (
    <Card style={{ maxWidth: 420 }}>
      <CardHeader>
        <CardTitle>SFI-2026-0041</CardTitle>
        <CardDescription>Toronto → Detroit · departed 2 h ago</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={row}>
          <span>Weight</span>
          <span style={num}>1,240 kg</span>
        </div>
        <div style={row}>
          <span>Declared value</span>
          <span style={num}>$4,120.00</span>
        </div>
        <div style={row}>
          <span>ETA</span>
          <span style={num}>Jul 24, 14:00 EDT</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">View shipment</Button>
      </CardFooter>
    </Card>
  )
}

export function WithHeaderAction() {
  return (
    <Card style={{ maxWidth: 420 }}>
      <CardHeader>
        <CardTitle>Customs documents</CardTitle>
        <CardDescription>3 of 4 uploaded · commercial invoice missing</CardDescription>
        <CardAction>
          <Button size="sm">Upload</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        Bill of lading, certificate of origin, and packing list are ready for
        review. The commercial invoice is required before pickup on Jul 23.
      </CardContent>
    </Card>
  )
}
