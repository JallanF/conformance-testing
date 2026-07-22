// =============================================================================
// WHAT: Order Workflow tab page (nested route under Order Details)
// ROLE: Renders server-supplied available actions as buttons and a
//       confirmation modal before executing them. Action outcomes appear as
//       toasts (fired by the orchestration hook), so this page renders no
//       PageMessage. JSX and layout only — all logic in useOrderWorkflowPage().
// =============================================================================

import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/shared/technical-components/ConfirmationModal'
import { SectionCard } from '@/shared/technical-components/SectionCard'
import { PageStatus } from '@/shared/technical-components/PageStatus'
import { useOrderWorkflowPage } from './useOrderWorkflowPage'

export function OrderWorkflowPage() {
  const {
    // data
    order,
    availableActions,
    // status flags
    isLoading,
    isError,
    isActioning,
    // handlers
    handleRequestWorkflowAction,
    // sub-object state — confirmation modal
    isActionConfirmationModalOpen,
    confirmationConfig,
    handleConfirmWorkflowAction,
    handleCancelWorkflowAction,
  } = useOrderWorkflowPage()

  if (isLoading) {
    return <PageStatus message="Loading…" />
  }
  if (isError || !order) {
    return <PageStatus message="Order could not be loaded." />
  }

  return (
    <>
      <SectionCard
        title="Available Actions"
        hint={`Actions available for this order in its current state (${order.status}). Available actions are determined by the server.`}
      >
        {/* PATTERN: availableActions
            The backend supplies which actions are currently permitted.
            The frontend renders buttons for each available action.
            The frontend never decides what is permitted. */}
        <div className="flex flex-wrap gap-3">
          {availableActions.includes('approve') && (
            <Button
              onClick={() => handleRequestWorkflowAction('approve')}
              disabled={isActioning}
            >
              Approve Order
            </Button>
          )}
          {availableActions.includes('cancel') && (
            <Button
              variant="destructive"
              onClick={() => handleRequestWorkflowAction('cancel')}
              disabled={isActioning}
            >
              Cancel Order
            </Button>
          )}
          {availableActions.includes('dispatch') && (
            <Button
              onClick={() => handleRequestWorkflowAction('dispatch')}
              disabled={isActioning}
            >
              Dispatch Order
            </Button>
          )}
          {availableActions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No actions available for this order in its current state.
            </p>
          )}
        </div>
      </SectionCard>

      {/* PATTERN: Confirmation modal (Type A)
          Owned by orchestration hook. Rendered at root so it overlays correctly. */}
      <ConfirmationModal
        isOpen={isActionConfirmationModalOpen}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmLabel={confirmationConfig.confirmLabel}
        isDangerous={confirmationConfig.isDangerous}
        onConfirm={handleConfirmWorkflowAction}
        onCancel={handleCancelWorkflowAction}
      />
    </>
  )
}
