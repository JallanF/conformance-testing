import * as React from 'react'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
} from 'sfi-crossings-ds'

// Portal trap: the capture host scopes `.dark` on the provider div, but Base
// UI portals default to document.body — outside the dark scope, so a portaled
// panel would pick up light :root tokens. Passing `container` on the vendor's
// own Portal part re-roots it inside the story; DialogContent's internal
// portal chains to it through Base UI's parent-portal context, and the
// harness's transformed story root keeps `fixed` positioning inside the card.
// Vendor parts only — no custom classes.

export function AddPickupContact() {
  const [scope, setScope] = React.useState<HTMLElement | null>(null)
  return (
    <div ref={setScope}>
      {/* Page context the modal opens over */}
      <Card style={{ maxWidth: 420 }}>
        <CardHeader>
          <CardTitle>SFI-2026-0041</CardTitle>
          <CardDescription>Toronto → Detroit · pickup Jul 23, 08:00 EDT</CardDescription>
        </CardHeader>
      </Card>
      <Dialog defaultOpen>
        <DialogPortal container={scope}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add pickup contact</DialogTitle>
              <DialogDescription>
                This contact receives pickup notifications for SFI-2026-0041.
              </DialogDescription>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field>
                <FieldLabel htmlFor="pickup-name">Full name</FieldLabel>
                <Input id="pickup-name" defaultValue="Dana Whitfield" />
              </Field>
              <Field>
                <FieldLabel htmlFor="pickup-phone">Mobile phone</FieldLabel>
                <Input id="pickup-phone" placeholder="+1 (416) 555-0182" />
              </Field>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button>Save contact</Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  )
}

export function TriggerClosed() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Add pickup contact
      </DialogTrigger>
    </Dialog>
  )
}
