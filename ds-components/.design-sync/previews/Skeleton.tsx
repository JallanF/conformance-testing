import { Card, CardContent, CardHeader, Skeleton } from 'sfi-crossings-ds'

// A shipment summary card while the record loads.
export function PanelLoading() {
  return (
    <Card style={{ maxWidth: 420 }}>
      <CardHeader>
        <Skeleton style={{ height: 16, width: '45%' }} />
        <Skeleton style={{ height: 12, width: '70%' }} />
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton style={{ height: 12, width: '100%' }} />
        <Skeleton style={{ height: 12, width: '92%' }} />
        <Skeleton style={{ height: 12, width: '60%' }} />
      </CardContent>
    </Card>
  )
}

// A shipment list while results load: leading thumbnail + two lines per row.
export function ListLoading() {
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton style={{ height: 40, width: 40, flexShrink: 0 }} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              flexGrow: 1,
            }}
          >
            <Skeleton style={{ height: 12, width: '55%' }} />
            <Skeleton style={{ height: 12, width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
