// =============================================================================
// WHAT: Edit Order page
// ROLE: The primary demonstration of the pull pattern. Renders editable
//       Business Components and passes their refs to the orchestration hook.
//       All logic in useEditOrderPage().
//
// HOW TO READ THIS FILE:
//   This page is best understood by reading it alongside useEditOrderPage.ts.
//   The Page passes refs to Business Components. The hook calls getData()
//   on those refs when the user saves. The Page never touches form data.
//
// KEY THINGS TO NOTICE IN THE JSX:
//   1. Each Business Component receives a `ref` prop — this enables pull pattern
//   2. `canEdit` prop controls whether sections render in edit or read-only mode
//   3. The save button calls hook.handleSave — no data collection in the JSX
//   4. ConfirmationModal for unsaved-changes guard (useBlocker)
//   5. Customer is fixed after creation — CustomerSection is read-only here
// =============================================================================

import { Button } from '@/components/ui/button'
import { AddressSection } from '@/shared/business-components/AddressSection'
import { CustomerSection } from '@/shared/business-components/CustomerSection'
import { OrderItemsSection } from '@/shared/business-components/OrderItemsSection'
import { CollapsibleSection } from '@/shared/technical-components/CollapsibleSection'
import { ConfirmationModal } from '@/shared/technical-components/ConfirmationModal'
import { PageContent } from '@/shared/technical-components/PageContent'
import { PageMessageBanner } from '@/shared/technical-components/PageMessageBanner'
import { PageStatus } from '@/shared/technical-components/PageStatus'
import { useEditOrderPage } from './useEditOrderPage'

// PAGE: JSX and layout only.
export function EditOrderPage() {
  const {
    // identity
    orderId,
    // data
    order,
    customerAddresses,
    products,
    // status flags
    isLoading,
    isError,
    isSaving,
    // derived booleans
    canEdit,
    // handlers
    handleSave,
    handleCancel,
    // sub-object state — section refs
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
  } = useEditOrderPage()

  if (isLoading) {
    return <PageContent><PageStatus message="Loading order…" /></PageContent>
  }

  if (isError || !order) {
    return (
      <PageContent>
        <PageStatus title="Order not found" message={`Order ${orderId} could not be loaded.`} />
      </PageContent>
    )
  }

  return (
    <PageContent>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Edit Order — {orderId}</h1>
          <span className="text-sm text-muted-foreground">
            {order.customerName}
          </span>
        </div>
      </div>

      <PageMessageBanner message={pageMessage} onDismiss={() => setPageMessage(null)} />

      {/* PATTERN: Pull pattern — ref passed to Business Component
          customerSectionRef is defined in useEditOrderPage.
          On Save, the hook calls customerSectionRef.current?.getData()
          to collect and validate customer data. */}
      <CustomerSection
        ref={customerSectionRef}
        initialCustomerId={order.customerId}
        initialCustomerName={order.customerName}
        // DOMAIN RULE: the customer is fixed after order creation — you cannot
        // change which customer an order belongs to on the edit page. Rendered
        // read-only here; address and line items remain editable. There is no
        // onCustomerChange because there is no customer-change path on this page;
        // the customer->addresses dependent-loading demo lives in create-order.
        canEdit={false}
      />

      {/* SHARED BUSINESS COMPONENT: AddressSection
          Edits the SINGLE delivery address for this order. The `addresses` prop is
          an optional pick-list of the (fixed) customer's saved addresses, loaded
          once — the user may pick one instead of typing a new one. It edits ONE
          address; the array is selectable options, not multiple addresses. */}
      <AddressSection
        ref={addressSectionRef}
        initialAddress={order.deliveryAddress}
        addresses={customerAddresses}
        canEdit={canEdit}
        title="Delivery Address"
      />

      {/* PATTERN: CONTAINER Technical Component above a Business Component
          (cc27 / the container case). The collapsible owns only UI state;
          keepMounted keeps the EDITING section mounted while collapsed, so
          its form state and ref survive — the hook's save still pulls it
          via orderItemsRef exactly as before. */}
      <CollapsibleSection label="Line Items" defaultOpen={true}>
        {/* BUSINESS COMPONENT: OrderItemsSection — useFieldArray */}
        <OrderItemsSection
          ref={orderItemsRef}
          initialLineItems={order.lineItems}
          products={products}
          canEdit={canEdit}
        />
      </CollapsibleSection>

      {/* Page actions */}
      <div className="mt-6 flex items-center gap-3 border-t pt-5">
        <Button onClick={handleSave} disabled={isSaving || !canEdit}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {/* PATTERN: Unsaved changes guard
          This modal is triggered by useBlocker when the user tries to navigate
          away with unsaved changes. The orchestration hook manages the state. */}
      <ConfirmationModal
        isOpen={isLeaveConfirmationModalOpen}
        title="Leave without saving?"
        message="You have unsaved changes. If you leave now, your changes will be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Stay on page"
        isDangerous={true}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </PageContent>
  )
}
