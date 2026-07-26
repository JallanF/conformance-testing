import type * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'sfi-crossings-ds'

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

// A shipment record view's facets: Info / Documents / Tracking.
export function RecordFacets() {
  return (
    <Tabs defaultValue="info" style={{ maxWidth: 420 }}>
      <TabsList>
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
      </TabsList>
      <TabsContent value="info">
        <div style={row}>
          <span>Route</span>
          <span>Toronto → Detroit</span>
        </div>
        <div style={row}>
          <span>Weight</span>
          <span style={num}>1,240 kg</span>
        </div>
        <div style={row}>
          <span>Declared value</span>
          <span style={num}>$4,120.00</span>
        </div>
      </TabsContent>
      <TabsContent value="documents">
        Bill of lading, certificate of origin, and packing list uploaded.
      </TabsContent>
      <TabsContent value="tracking">
        Last scan: Ambassador Bridge, Jul 22 09:14 EDT.
      </TabsContent>
    </Tabs>
  )
}

export function LineVariant() {
  return (
    <Tabs defaultValue="documents" style={{ maxWidth: 420 }}>
      <TabsList variant="line">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
      </TabsList>
      <TabsContent value="documents">
        <div style={row}>
          <span>Bill of lading</span>
          <span style={num}>Jul 21, 16:02</span>
        </div>
        <div style={row}>
          <span>Commercial invoice</span>
          <span style={num}>Jul 22, 08:47</span>
        </div>
      </TabsContent>
    </Tabs>
  )
}

// Invoicing is unavailable until the shipment is delivered.
export function WithDisabledTab() {
  return (
    <Tabs defaultValue="tracking" style={{ maxWidth: 420 }}>
      <TabsList>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="invoicing" disabled>
          Invoicing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tracking">
        In transit — crossed at Ambassador Bridge, 41 km to delivery.
      </TabsContent>
    </Tabs>
  )
}
