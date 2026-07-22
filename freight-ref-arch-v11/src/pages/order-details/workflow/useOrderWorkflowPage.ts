// =============================================================================
// WHAT: Order Workflow tab orchestration hook
// ROLE: Logic for the Workflow tab — server-supplied available actions,
//       confirmation modal (Type A), and executing approve/cancel mutations.
//
// SELF-CONTAINED ROUTE:
//   Fetches the order via useOrderQuery (deduped with the layout's fetch).
//
// PATTERNS DEMONSTRATED:
//   • availableActions — the backend supplies which actions are permitted;
//     this hook exposes them and the page renders buttons. The frontend never
//     decides what is permitted.
//   • Confirmation modal (Type A) — this hook owns the modal state; on confirm
//     it executes the pending workflow action.
//   • Action outcome → toast (cc27 / Toasts and Page Messages) — the outcome
//     ("Order approved") is a toast, not a page banner. This tab has no
//     PageMessage: nothing here is in-page state the user must act on.
// =============================================================================

import { useState } from 'react'
import { useParams } from 'react-router'
import { showSuccessToast, showErrorToast } from '@/app/Notifications'
import { useOrderQuery } from '@/shared/data/orderDataHooks'
import { useApproveOrderMutation, useCancelOrderMutation, useDispatchOrderMutation } from './workflowDataHooks'

type PendingAction = 'approve' | 'cancel' | 'dispatch' | null

export function useOrderWorkflowPage() {
  const { orderId = '' } = useParams()

  // --- Server state -------------------------------------------------------
  const { data: order, isPending: isLoading, isError } = useOrderQuery(orderId)

  // --- Mutation hooks -----------------------------------------------------
  const { approveOrder, isPending: isApproving } = useApproveOrderMutation()
  const { cancelOrder, isPending: isCancelling } = useCancelOrderMutation()
  const { dispatchOrder, isPending: isDispatching } = useDispatchOrderMutation()

  // --- UI state -----------------------------------------------------------
  // PATTERN: Confirmation modal state, owned by the orchestration hook.
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  // --- Workflow action handlers -------------------------------------------

  // Modal open/close primitives. pendingAction is the single source of truth:
  // it drives which confirmation is shown and (via the derived flag in the
  // return) whether the modal is open. Internal — the page calls the handle…
  // functions, never these directly.
  const openActionConfirmationModal = (action: 'approve' | 'cancel' | 'dispatch') => setPendingAction(action)
  const closeActionConfirmationModal = () => setPendingAction(null)

  // Called when the user clicks a workflow action button. Opens the
  // confirmation modal — does NOT execute the action yet.
  const handleRequestWorkflowAction = (action: 'approve' | 'cancel' | 'dispatch') => {
    openActionConfirmationModal(action)
  }

  // Called when the user confirms the action in the modal.
  const handleConfirmWorkflowAction = () => {
    if (!pendingAction || !orderId) return

    // PATTERN: Action outcome → toast (success and failure alike).
    if (pendingAction === 'approve') {
      approveOrder(orderId, {
        onSuccess: () => showSuccessToast('Order approved successfully.'),
        onError: (error) => showErrorToast(error.message),
      })
    }
    if (pendingAction === 'cancel') {
      cancelOrder(orderId, {
        onSuccess: () => showSuccessToast('Order cancelled.'),
        onError: (error) => showErrorToast(error.message),
      })
    }
    if (pendingAction === 'dispatch') {
      dispatchOrder(orderId, {
        onSuccess: () => showSuccessToast('Order dispatched.'),
        onError: (error) => showErrorToast(error.message),
      })
    }
    closeActionConfirmationModal()
  }

  const handleCancelWorkflowAction = () => closeActionConfirmationModal()

  // --- Confirmation modal config ------------------------------------------
  const confirmationConfig =
    pendingAction === 'approve'
      ? { title: 'Approve Order', message: `Are you sure you want to approve order ${orderId}? This will allow it to be dispatched.`, confirmLabel: 'Approve', isDangerous: false }
      : pendingAction === 'dispatch'
      ? { title: 'Dispatch Order', message: `Are you sure you want to dispatch order ${orderId}? This will mark it as sent.`, confirmLabel: 'Dispatch', isDangerous: false }
      : { title: 'Cancel Order', message: `Are you sure you want to cancel order ${orderId}? This action cannot be undone.`, confirmLabel: 'Cancel Order', isDangerous: true }

  return {
    // data
    order,
    availableActions: order?.availableActions ?? [],
    // status flags
    isLoading,
    isError,
    isActioning: isApproving || isCancelling || isDispatching,
    // handlers
    handleRequestWorkflowAction,
    // sub-object state — confirmation modal
    isActionConfirmationModalOpen: pendingAction !== null,
    confirmationConfig,
    handleConfirmWorkflowAction,
    handleCancelWorkflowAction,
  }
}
