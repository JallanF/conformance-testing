import { Alert, AlertAction, AlertDescription, AlertTitle, Button } from 'sfi-crossings-ds'
import { Info, OctagonAlert } from 'lucide-react'

export function Default() {
  return (
    <Alert style={{ maxWidth: 520 }}>
      <Info />
      <AlertTitle>Documents ready</AlertTitle>
      <AlertDescription>
        Your waybill and customs paperwork for SFI-2026-0041 are ready to
        download.
      </AlertDescription>
    </Alert>
  )
}

export function Destructive() {
  return (
    <Alert variant="destructive" style={{ maxWidth: 520 }}>
      <OctagonAlert />
      <AlertTitle>Customs hold</AlertTitle>
      <AlertDescription>
        CBSA has placed shipment SFI-2026-0038 on hold pending a corrected
        commercial invoice. Bookings against this shipment are blocked until it
        clears.
      </AlertDescription>
    </Alert>
  )
}

export function WithAction() {
  return (
    <Alert style={{ maxWidth: 520 }}>
      <Info />
      <AlertTitle>Rate change notice</AlertTitle>
      <AlertDescription>
        Cross-border LTL rates change on Aug 1. Existing quotes keep their
        locked rate until expiry.
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="xs">Review rates</Button>
      </AlertAction>
    </Alert>
  )
}
