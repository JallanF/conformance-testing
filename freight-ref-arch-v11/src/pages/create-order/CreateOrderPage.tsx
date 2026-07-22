// =============================================================================
// WHAT: Create Order page
// ROLE: Demonstrates the page-level wizard pattern. Renders WizardChrome
//       with step Business Components as children. All logic in useCreateOrderPage().
//
// WIZARD PATTERN AT PAGE LEVEL (cc27 / Screen Composition / Wizard Pattern):
//   Compare this to AddAllocationModal (warehousing) which is the same pattern
//   at MODAL level — the wizard sits inside a Business Component.
//   Here it is the entire page.
//
// HOW WIZARDS WORK:
//   1. currentStep state lives in the orchestration hook
//   2. Each step is a Business Component with a ref
//   3. WizardChrome receives currentStep and navigation handlers
//   4. On Next: hook calls getData() on current step ref, advances if valid
//   5. On Submit: hook collects all steps and calls createOrder mutation
//
// ALL STEPS STAY MOUNTED — INACTIVE STEPS ARE HIDDEN, NOT UNMOUNTED:
//   Each step's form state lives INSIDE the step (Business Components own
//   their editing state), and React clears a component's state and its ref
//   when it unmounts. If only the active step were mounted:
//     • Back would silently discard everything the user typed, and
//     • Submit could not collect the earlier steps (their refs would be null).
//   So every step renders on every step; the inactive ones get Tailwind's
//   `hidden` utility (display: none). The data-driven class ternary is the
//   standard conditional-modifier pattern (cc27 / Styling) — currentStep
//   chooses the class; hidden ≠ unmounted.
//
// READING ORDER:
//   Read useCreateOrderPage.ts first to understand the orchestration.
//   Then return here to see how the JSX delegates everything to it.
// =============================================================================

import { AddressSection } from '@/shared/business-components/AddressSection'
import { CustomerSection } from '@/shared/business-components/CustomerSection'
import { OrderItemsSection } from '@/shared/business-components/OrderItemsSection'
import { PageContent } from '@/shared/technical-components/PageContent'
import { PageMessageBanner } from '@/shared/technical-components/PageMessageBanner'
import { WizardChrome } from '@/shared/technical-components/WizardChrome'
import { useCustomersQuery } from '@/shared/data/selectorDataHooks'
import { useCreateOrderPage, WIZARD_STEPS } from './useCreateOrderPage'
import { CarrierStep } from './CreateOrderComponents'

// Picks the panel class for a step: visible when active, hidden otherwise.
// Hidden — NOT unmounted — so form state and refs survive (see header).
function stepPanelClass(isActive: boolean): string {
  return isActive ? '' : 'hidden'
}

// PAGE: JSX and layout only. Wizard orchestration in useCreateOrderPage().
export function CreateOrderPage() {
  const {
    // data
    currentStep,
    customerAddresses,
    products,
    carriers,
    serviceLevels,
    // status flags
    isSubmitting,
    // handlers
    handleNext,
    handleBack,
    handleSubmit,
    handleCustomerChange,
    // sub-object state — step refs
    customerStepRef,
    addressStepRef,
    orderItemsRef,
    carrierStepRef,
    // sub-object state — page message
    pageMessage,
    setPageMessage,
  } = useCreateOrderPage()

  const { data: customers = [] } = useCustomersQuery()

  return (
    <PageContent>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">New Order</h1>
      </div>

      <PageMessageBanner message={pageMessage} onDismiss={() => setPageMessage(null)} />

      {/* PATTERN: Page-level wizard
          WizardChrome renders step indicators and Back/Next/Submit buttons.
          ALL steps render as children — the inactive ones hidden by class,
          never unmounted (see header comment for why). */}
      <WizardChrome
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className={stepPanelClass(currentStep === 0)}>
          <CustomerSection
            ref={customerStepRef}
            customers={customers}
            canEdit={true}
            onCustomerChange={handleCustomerChange}
          />
        </div>
        <div className={stepPanelClass(currentStep === 1)}>
          <AddressSection
            ref={addressStepRef}
            addresses={customerAddresses}
            canEdit={true}
            title="Delivery Address"
          />
        </div>
        <div className={stepPanelClass(currentStep === 2)}>
          <OrderItemsSection
            ref={orderItemsRef}
            products={products}
            canEdit={true}
          />
        </div>
        <div className={stepPanelClass(currentStep === 3)}>
          <CarrierStep
            ref={carrierStepRef}
            carriers={carriers}
            serviceLevels={serviceLevels}
          />
        </div>
      </WizardChrome>
    </PageContent>
  )
}
