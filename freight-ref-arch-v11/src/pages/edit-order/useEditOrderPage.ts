// =============================================================================
// WHAT: Edit Order page orchestration hook
// ROLE: Contains all logic for the Edit Order page. This is the most complex
//       orchestration hook in the application — it demonstrates the most
//       architectural patterns in one place.
//
// PATTERNS DEMONSTRATED:
//
//   1. Pull Pattern (cc27 / Screen Composition / Business Component Ref Contract)
//      On Save, this hook calls getData() on each section ref.
//      Each Business Component validates its own form and returns data.
//      This hook receives the data and assembles the save payload.
//      Business Components do not know about each other.
//
//   2. Cross-component validation
//      After pulling data from all sections, this hook checks for conditions
//      that span multiple sections (e.g. "must have at least one line item").
//      Business Components validate their own fields; the orchestration hook
//      validates cross-component rules.
//
//   3. Dependent data loading (customer's addresses)
//      The customer is fixed after order creation, so addresses load for the
//      order's own customer. order.customerId is passed straight to
//      useCustomerAddressesQuery, which enables reactively once the order loads.
//      The loaded addresses are passed as a prop to AddressSection.
//
//   4. Unsaved changes — useBlocker (React Router v6)
//      isDirty() is called on each section ref to check for unsaved changes.
//      useBlocker() intercepts navigation attempts when dirty.
//      A ConfirmationModal asks the user to confirm leaving.
//
//   5. Defensive ref access on save
//      All three sections here are rendered unconditionally, so their refs are
//      always populated. The save flow still uses ?. defensively — a null ref
//      simply reads as "invalid" via the !result?.isValid guard — but the null
//      case never occurs on this page. The genuine "conditionally-rendered
//      section → null ref" pattern is described in cc27 (Null Ref Check).
// =============================================================================

import { useRef, useState } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router'
import { showSuccessToast, showErrorToast } from '@/app/Notifications'
import { useOrderQuery } from '@/shared/data/orderDataHooks'
import {
  useCustomerAddressesQuery,
  useProductsQuery,
} from '@/shared/data/selectorDataHooks'
import { useSaveOrderMutation } from './editOrderDataHooks'
import type { PageMessage } from '@/shared/types/uiTypes'
import type { CustomerSectionHandle } from '@/shared/business-components/CustomerSection'
import type { OrderItemsSectionHandle } from '@/shared/business-components/OrderItemsSection'
import type { AddressSectionHandle } from '@/shared/business-components/AddressSection'

export function useEditOrderPage() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()

  // --- Server state -------------------------------------------------------
  const { data: order, isPending: isLoading, isError } = useOrderQuery(orderId)
  const { saveOrder, isPending: isSaving } = useSaveOrderMutation()
  const { data: products } = useProductsQuery()

  // --- Action availability (server-supplied) ------------------------------
  // PATTERN: editability follows availableActions, never role — the page is
  // editable iff the server lists 'edit' among the order's actions. Same rule
  // as every workflow action (cc26 / Security and Permissions).
  const canEdit = order?.availableActions.includes('edit') ?? false

  // --- Section refs (Pull Pattern) ----------------------------------------
  // PATTERN: Section refs
  // Each ref corresponds to a Business Component rendered in the Page JSX.
  // This hook calls getData() on each ref when the user saves.
  // The Page JSX passes these refs as the `ref` prop to each Business Component.
  const customerSectionRef = useRef<CustomerSectionHandle>(null)
  const addressSectionRef = useRef<AddressSectionHandle>(null)
  const orderItemsRef = useRef<OrderItemsSectionHandle>(null)

  // --- UI state -----------------------------------------------------------
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null)
  const [isLeaveConfirmationModalOpen, setIsLeaveConfirmationModalOpen] = useState(false)

  // Leave-confirmation modal open/close primitives (internal). Boolean source
  // of truth; opened by the navigation blocker below, not by a page button.
  const openLeaveConfirmationModal = () => setIsLeaveConfirmationModalOpen(true)
  const closeLeaveConfirmationModal = () => setIsLeaveConfirmationModalOpen(false)

  // --- Dependent data loading (customer's addresses) ----------------------
  // The customer is FIXED after order creation — you cannot reassign an order to a
  // different customer (see EditOrderPage / CustomerSection, read-only here). So
  // addresses load for the order's own customer. Passing order.customerId straight
  // to the query (rather than snapshotting it into state) means the fetch enables
  // reactively once the order has loaded; there is no customer-change event to
  // handle. The loaded addresses are passed as a prop to AddressSection.
  const { data: customerAddresses = [] } = useCustomerAddressesQuery(order?.customerId ?? null)

  // --- Unsaved changes (useBlocker) ---------------------------------------
  // PATTERN: Unsaved changes guard
  // useBlocker intercepts all navigation attempts while this page is mounted.
  // The condition function checks all section refs for dirty state.
  // When blocked, we show a ConfirmationModal asking the user to confirm leaving.
  //
  // After a successful save there are no unsaved changes, so the navigation the
  // save triggers must not be intercepted. A ref (not state) avoids depending on
  // RHF's isDirty() having re-rendered to false in the same tick as reset().
  const hasJustSavedRef = useRef(false)

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (hasJustSavedRef.current) return false
    if (currentLocation.pathname === nextLocation.pathname) return false
    // PATTERN: Null ref check — call isDirty() only if the ref's component is mounted
    const isAnySectionDirty =
      (customerSectionRef.current?.isDirty() ?? false) ||
      (addressSectionRef.current?.isDirty() ?? false) ||
      (orderItemsRef.current?.isDirty() ?? false)
    return isAnySectionDirty
  })

  const handleConfirmLeave = () => {
    blocker.proceed?.()
    closeLeaveConfirmationModal()
  }
  const handleCancelLeave = () => {
    blocker.reset?.()
    closeLeaveConfirmationModal()
  }

  // Show the leave confirmation when the blocker fires
  if (blocker.state === 'blocked' && !isLeaveConfirmationModalOpen) {
    openLeaveConfirmationModal()
  }

  // --- Save handler -------------------------------------------------------
  // PATTERN: Pull pattern — async save flow
  // 1. Call getData() on each section ref (async — validates form first)
  // 2. Check isValid on each result
  // 3. Cross-component validation
  // 4. Call save mutation with assembled payload
  const handleSave = async () => {
    // PATTERN: Pull from all sections simultaneously (parallel async).
    // NOTE: CustomerSection is read-only here (canEdit=false), so its getData()
    // returns the order's unchanged customer from the form's defaultValues; the
    // `required` rule is inert because the field isn't rendered. We still pull it
    // for uniformity — every section is pulled the same way.
    const [customerResult, addressResult, itemsResult] = await Promise.all([
      customerSectionRef.current?.getData(),
      addressSectionRef.current?.getData(),
      orderItemsRef.current?.getData(),
    ])

    // If any section is invalid (or its ref is somehow null), each section has
    // already shown its own field-level errors. We show a page-level summary.
    // TYPESCRIPT NOTE: this guard NARROWS each SectionDataResult — after it,
    // the compiler knows every result's data is present. No "!" needed below.
    if (!customerResult?.isValid || !addressResult?.isValid || !itemsResult?.isValid) {
      setPageMessage({ type: 'error', text: 'Please correct the highlighted errors and try again.' })
      return
    }

    // PATTERN: Cross-component validation
    // This rule spans multiple sections — it cannot live inside either section.
    // The orchestration hook is the correct place for cross-component rules.
    if (itemsResult.data.lineItems.length === 0) {
      setPageMessage({ type: 'error', text: 'An order must have at least one line item.' })
      return
    }

    const payload = {
      customerId: customerResult.data.customerId,
      deliveryAddress: addressResult.data,
      lineItems: itemsResult.data.lineItems,
    }

    saveOrder(
      { orderId, payload },
      {
        onSuccess: () => {
          // Clear dirty state and mark that we just saved, so the unsaved-changes
          // guard allows the navigation below.
          customerSectionRef.current?.reset()
          addressSectionRef.current?.reset()
          orderItemsRef.current?.reset()
          hasJustSavedRef.current = true
          // PATTERN: Action outcome → toast (cc27 / Toasts and Page Messages).
          // The toast portal lives above the router (see App.tsx), so this
          // message survives the navigation back to the read-only order view.
          showSuccessToast('Order saved successfully.')
          navigate(`/orders/${orderId}`)
        },
        onError: (error) => {
          // Action outcome (failure) → toast, same as success.
          showErrorToast(`Save failed: ${error.message}`)
        },
      }
    )
  }

  const handleCancel = () => navigate(`/orders/${orderId}`)

  return {
    // identity
    orderId,
    // data
    order,
    customerAddresses,
    products: products ?? [],
    // status flags
    isLoading,
    isError,
    isSaving,
    // derived booleans
    canEdit,
    // handlers
    handleSave,
    handleCancel,
    // sub-object state — section refs (passed as ref prop to Business Components)
    customerSectionRef,
    addressSectionRef,
    orderItemsRef,
    // sub-object state — page message
    pageMessage,
    setPageMessage,
    // sub-object state — unsaved-changes confirmation
    isLeaveConfirmationModalOpen,
    handleConfirmLeave,
    handleCancelLeave,
  }
}
