import * as React from 'react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Toaster,
  toast,
} from 'sfi-crossings-ds'

// Toasts must be fired imperatively; sonner's Toaster subscribes to the toast
// store in its own mount effect, and effects flush in tree order, so this
// sibling rendered after <Toaster /> fires once the store has a subscriber.
// duration: Infinity keeps the toasts visible for the static capture.
function FireToasts() {
  React.useEffect(() => {
    toast.success('Waybill uploaded', {
      description: 'SFI-2026-0041 · waybill_0041.pdf attached',
      duration: Infinity,
    })
    toast.error('Customs hold on SFI-2026-0044', {
      description: 'CBSA requires a revised commercial invoice.',
      duration: Infinity,
    })
  }, [])
  return null
}

// Sonner renders inline (no portal) so it inherits the dark scope directly;
// theme="dark" pins sonner's own theme attribute instead of matchMedia.
export function ToastNotifications() {
  return (
    <div style={{ minHeight: 460 }}>
      {/* Page context the toasts appear over */}
      <Card style={{ maxWidth: 420 }}>
        <CardHeader>
          <CardTitle>Shipment documents</CardTitle>
          <CardDescription>SFI-2026-0041 · 4 files on record</CardDescription>
        </CardHeader>
      </Card>
      <Toaster theme="dark" position="bottom-right" />
      <FireToasts />
    </div>
  )
}
