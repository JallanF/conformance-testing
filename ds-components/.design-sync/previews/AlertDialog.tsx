import * as React from 'react'
import { TriangleAlert } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'sfi-crossings-ds'

// Portal trap (see Dialog.tsx): `container` on the vendor Portal part keeps
// the portaled panel inside the dark-scoped story root; AlertDialogContent's
// internal portal chains to it via Base UI's parent-portal context.

export function CancelBookingConfirmation() {
  const [scope, setScope] = React.useState<HTMLElement | null>(null)
  return (
    <div ref={setScope}>
      {/* Page context the confirmation opens over */}
      <Card style={{ maxWidth: 420 }}>
        <CardHeader>
          <CardTitle>SFI-2026-0041</CardTitle>
          <CardDescription>Toronto → Detroit · pickup Jul 23, 08:00 EDT</CardDescription>
        </CardHeader>
      </Card>
      <AlertDialog defaultOpen>
        <AlertDialogPortal container={scope}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <TriangleAlert />
              </AlertDialogMedia>
              <AlertDialogTitle>Cancel booking SFI-2026-0041?</AlertDialogTitle>
              <AlertDialogDescription>
                The carrier is released and the Jul 23 pickup window is
                forfeited. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep booking</AlertDialogCancel>
              <AlertDialogAction variant="destructive">Cancel booking</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </div>
  )
}

export function TriggerClosed() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        Cancel booking
      </AlertDialogTrigger>
    </AlertDialog>
  )
}
