import type * as React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from 'sfi-crossings-ds'

// Columned numbers: mono, tabular, right-aligned (product doctrine).
const num: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
}
const numHead: React.CSSProperties = { textAlign: 'right' }

const shipments = [
  { id: 'SFI-2026-0041', route: 'Toronto → Detroit', weight: '1,240 kg', total: '$4,120.00' },
  { id: 'SFI-2026-0042', route: 'Montreal → Boston', weight: '860 kg', total: '$2,310.50' },
  { id: 'SFI-2026-0043', route: 'Vancouver → Seattle', weight: '2,105 kg', total: '$6,890.25' },
  { id: 'SFI-2026-0044', route: 'Calgary → Denver', weight: '1,780 kg', total: '$5,204.75' },
  { id: 'SFI-2026-0045', route: 'Halifax → Portland', weight: '640 kg', total: '$1,975.00' },
]

export function ShipmentsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Shipment</TableHead>
          <TableHead>Route</TableHead>
          <TableHead style={numHead}>Weight</TableHead>
          <TableHead style={numHead}>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shipments.map((s) => (
          <TableRow key={s.id}>
            <TableCell>{s.id}</TableCell>
            <TableCell>{s.route}</TableCell>
            <TableCell style={num}>{s.weight}</TableCell>
            <TableCell style={num}>{s.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function TotalsFooter() {
  return (
    <Table>
      <TableCaption>Outbound shipments — week of Jul 20, 2026.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Shipment</TableHead>
          <TableHead>Route</TableHead>
          <TableHead style={numHead}>Weight</TableHead>
          <TableHead style={numHead}>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shipments.slice(0, 3).map((s) => (
          <TableRow key={s.id}>
            <TableCell>{s.id}</TableCell>
            <TableCell>{s.route}</TableCell>
            <TableCell style={num}>{s.weight}</TableCell>
            <TableCell style={num}>{s.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total (3 shipments)</TableCell>
          <TableCell style={num}>4,205 kg</TableCell>
          <TableCell style={num}>$13,320.75</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export function SelectedRow() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Shipment</TableHead>
          <TableHead>Route</TableHead>
          <TableHead style={numHead}>Weight</TableHead>
          <TableHead style={numHead}>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shipments.slice(0, 4).map((s, i) => (
          <TableRow key={s.id} data-state={i === 1 ? 'selected' : undefined}>
            <TableCell>{s.id}</TableCell>
            <TableCell>{s.route}</TableCell>
            <TableCell style={num}>{s.weight}</TableCell>
            <TableCell style={num}>{s.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
