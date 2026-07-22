// =============================================================================
// WHAT: Warehouse Details page orchestration hook
// ROLE: Contains all logic for the Warehouse Details page. Demonstrates
//       multiple advanced patterns alongside the standard ones.
//
// PATTERNS DEMONSTRATED:
//
//   1. Component-level wizard (AllocationWizard)
//      AllocationWizard is a Business Component that internally runs a wizard.
//      From the Page's perspective, it is just another ref-based section —
//      it exposes getData/reset/isDirty like any other Business Component.
//      The wizard steps are an internal implementation detail of that component.
//
//   2. Modal-level wizard (AddAllocationModal — Type B modal)
//      The AddAllocationModal is a Business Component inside a modal.
//      It follows the full pull pattern. This hook manages the modal's
//      open/close state. On modal submit, this hook pulls data from the
//      modal's ref and calls the addAllocation mutation.
//
//   3. Role-based field visibility
//      showCostFields — managers see cost per unit and total value.
//      Derived here; passed as props to AllocationsGrid and PremiumStorageSection.
//
//   4. Conditional section (PremiumStorageSection)
//      Only shown when hasPremiumStorage = true on the warehouse.
//
//   5. Confirmation modal (Type A) — remove allocation
//      Standard pattern: open modal → user confirms → call mutation.
//
//   6. AddressSection reuse (shared Business Component)
//      Demonstrates AddressSection being used in the warehousing feature,
//      the same component used in the orders feature.
// =============================================================================

import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { showSuccessToast, showErrorToast } from '@/app/Notifications'
import { useWarehouseQuery, useAddAllocationMutation, useRemoveAllocationMutation } from './warehouseDetailsDataHooks'
import type { AddAllocationModalHandle } from './WarehouseDetailsComponents'

export function useWarehouseDetailsPage() {
  const { warehouseId = '' } = useParams()

  // --- Server state -------------------------------------------------------
  const { data: warehouse, isPending: isLoading, isError } = useWarehouseQuery(warehouseId)
  const { addAllocation, isPending: isAdding } = useAddAllocationMutation()
  const { removeAllocation, isPending: isRemoving } = useRemoveAllocationMutation()

  // --- Presence-driven visibility -----------------------------------------
  // PATTERN: cost fields are shown iff the server SENT them. The backend
  // suppresses cost data for users without financial visibility (operators);
  // the FE renders on presence, never on role (cc26 / Security and Permissions).
  const showCostFields =
    warehouse?.allocations.some(allocation => allocation.costPerUnit != null) ?? false

  // --- Conditional section ------------------------------------------------
  // PATTERN: Section visibility derived from server data
  const showPremiumStorage = warehouse?.hasPremiumStorage === true

  // --- Add Allocation Modal (Type B) ref -----------------------------------
  // PATTERN: Modal-level Business Component with pull pattern
  // This ref is passed to AddAllocationModal. On modal submit, we call
  // addModalRef.current?.getData() to collect validated form data.
  const addModalRef = useRef<AddAllocationModalHandle>(null)
  const [isAddAllocationModalOpen, setIsAddAllocationModalOpen] = useState(false)

  // Add-allocation modal open/close primitives (internal — the page calls the
  // handle… functions, never these). Boolean source of truth; no payload.
  const openAddAllocationModal = () => setIsAddAllocationModalOpen(true)
  const closeAddAllocationModal = () => setIsAddAllocationModalOpen(false)

  // --- Remove Allocation confirmation (Type A) ----------------------------
  // pendingRemoveId is the single source of truth: it carries WHICH allocation
  // and (via the derived flag in the return) whether the modal is open.
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const openRemoveConfirmationModal = (allocationId: string) => setPendingRemoveId(allocationId)
  const closeRemoveConfirmationModal = () => setPendingRemoveId(null)

  // --- Handlers -----------------------------------------------------------

  const handleRequestAddAllocation = () => openAddAllocationModal()

  // Called by the Add Allocation Modal's Submit button.
  // PATTERN: Modal Type B pull
  // The modal submit button is in the Page (not inside the modal component).
  // The Page calls getData() on the modal ref, then closes the modal and
  // calls the mutation with the collected data.
  const handleSubmitNewAllocation = async () => {
    const result = await addModalRef.current?.getData()
    if (!result?.isValid) return  // Modal shows its own field-level errors
    // (that guard also NARROWS the SectionDataResult — data is known present)

    closeAddAllocationModal()
    addModalRef.current?.reset()

    // PATTERN: Action outcome → toast (cc27 / Toasts and Page Messages).
    addAllocation(
      { warehouseId, payload: result.data },
      {
        onSuccess: () => showSuccessToast('Allocation added successfully.'),
        onError: (error) => showErrorToast(`Failed to add allocation: ${error.message}`),
      }
    )
  }

  const handleCancelAddAllocation = () => {
    closeAddAllocationModal()
    addModalRef.current?.reset()
  }

  const handleRequestRemoveAllocation = (allocationId: string) => {
    openRemoveConfirmationModal(allocationId)
  }

  const handleConfirmRemoveAllocation = () => {
    if (!pendingRemoveId) return
    // PATTERN: Action outcome → toast (cc27 / Toasts and Page Messages).
    removeAllocation(
      { warehouseId, allocationId: pendingRemoveId },
      {
        onSuccess: () => showSuccessToast('Allocation removed.'),
        onError: (error) => showErrorToast(error.message),
      }
    )
    closeRemoveConfirmationModal()
  }

  const handleCancelRemoveAllocation = () => closeRemoveConfirmationModal()

  return {
    // identity
    warehouseId,
    // data
    warehouse,
    // status flags
    isLoading,
    isError,
    // derived booleans
    showCostFields,
    showPremiumStorage,
    // sub-object state — add-allocation modal
    addModalRef,
    isAddAllocationModalOpen,
    isAdding,
    handleRequestAddAllocation,
    handleSubmitNewAllocation,
    handleCancelAddAllocation,
    // sub-object state — remove-allocation confirmation
    isRemoveConfirmationModalOpen: pendingRemoveId !== null,
    isRemoving,
    handleRequestRemoveAllocation,
    handleConfirmRemoveAllocation,
    handleCancelRemoveAllocation,
  }
}
