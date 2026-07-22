// =============================================================================
// WHAT: Confirmation modal — Type A
// ROLE: Presents a confirmation prompt before a significant or destructive
//       action. Raises 'confirmed' or 'cancelled' events to the parent.
//       Has no form, no data, no pull pattern.
//
// MODAL TYPES (cc27 / Screen Composition / Modal Types):
//   Type A (this component) — Confirmation only. No data entry.
//     "Are you sure you want to approve this order?"
//     Used for: approve, cancel, dispatch, remove allocation
//
//   Type B — Data entry modal. A Business Component inside a modal.
//     Follows the full pull pattern (getData, reset, isDirty).
//     Example: AddAllocationModal in pages/warehouse-details/WarehouseDetailsComponents.tsx
//
// ARCHITECTURE NOTE:
//   The Page orchestration hook owns the modal's open/close state. It exposes
//   open…Modal() / close…Modal() intent verbs and a derived is…ModalOpen flag
//   (cc27 / Screen Composition / Modal Types). When the user requests a
//   significant action, a handle… function
//   opens the modal (storing which action is pending); on confirm, the
//   orchestration hook executes the action and closes the modal.
//
//   This component knows nothing about what action it is confirming.
//   It is purely presentational — it renders the title and message it
//   receives as props and fires events.
//
// IMPLEMENTATION — ui/alert-dialog (Base UI AlertDialog underneath):
//   AlertDialog is the correct primitive for Type A: it exists precisely for
//   prompts that demand an explicit choice. Its semantics match the RA's
//   modal rules with no configuration:
//     - Escape closes — Base UI raises onOpenChange(false), which this
//       component maps to onCancel. (The hand-written keydown listener of
//       earlier versions is gone — the primitive owns the keyboard.)
//     - Clicking the dark backdrop does NOT close — an accidental click must
//       never dismiss a confirmation. AlertDialog refuses outside-press
//       dismissal by design.
//   The dialog is CONTROLLED: the orchestration hook's is…ModalOpen drives the
//   open prop; there is no AlertDialogTrigger. Confirm is an ordinary Button —
//   the hook executes the action and closes by setting its own state.
//
// TECHNICAL COMPONENT: pure props in, events out. No internal state.
// =============================================================================

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string      // Defaults to 'Confirm'
  cancelLabel?: string       // Defaults to 'Cancel'
  isDangerous?: boolean      // If true, confirm button renders as destructive
  onConfirm: () => void
  onCancel: () => void
}

// TECHNICAL COMPONENT: receives all data and callbacks via props.
export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <AlertDialog
      open={isOpen}
      // Base UI raises open=false for Escape and for the Cancel (Close)
      // button. Both are the same event to the parent: 'cancelled'.
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={isDangerous ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
