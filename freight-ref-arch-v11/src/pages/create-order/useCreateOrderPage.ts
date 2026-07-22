// =============================================================================
// WHAT: Create Order page orchestration hook
// ROLE: Orchestrates the 4-step Create Order wizard. Demonstrates the
//       page-level wizard pattern.
//
// WIZARD PATTERN AT PAGE LEVEL (cc27 / Screen Composition / Wizard Pattern):
//   The wizard orchestration lives in this hook, not in the Page JSX.
//   The Page passes currentStep and navigation handlers to WizardChrome.
//   Each step is a Business Component passed as a child to WizardChrome.
//
//   Step refs work identically to section refs in EditOrderPage —
//   the orchestration hook calls getData() on the current step ref to
//   validate before advancing, and on ALL step refs on final submit.
//
// WIZARD STEPS:
//   0. Customer    — select customer (Business Component: CustomerSection)
//   1. Delivery    — delivery address (Business Component: AddressSection)
//   2. Items       — line items (Business Component: OrderItemsSection)
//   3. Carrier     — carrier + service level
//
// WHERE THE STEP DATA LIVES:
//   In the steps themselves — each step is a Business Component that owns its
//   form state, exactly like sections on the Edit page. This hook stores NO
//   step data. That works because the Page keeps ALL steps mounted (inactive
//   ones hidden, not unmounted — see CreateOrderPage.tsx), so every step's
//   state and ref survive until Submit, when this hook pulls them all.
// =============================================================================

import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { showSuccessToast, showErrorToast } from '@/app/Notifications'
import {
  useProductsQuery,
  useCarriersQuery,
  useCustomerAddressesQuery,
} from '@/shared/data/selectorDataHooks'
import { useServiceLevelsReferenceDataQuery } from '@/shared/reference-data/referenceDataHooks'
import { useCreateOrderMutation } from './createOrderDataHooks'
import type { PageMessage } from '@/shared/types/uiTypes'
import type { CustomerSectionHandle } from '@/shared/business-components/CustomerSection'
import type { OrderItemsSectionHandle } from '@/shared/business-components/OrderItemsSection'
import type { AddressSectionHandle } from '@/shared/business-components/AddressSection'
import type { CarrierStepHandle } from './CreateOrderComponents'

export const WIZARD_STEPS = [
  { id: 'customer', label: 'Customer'  },
  { id: 'delivery', label: 'Delivery'  },
  { id: 'items',    label: 'Items'     },
  { id: 'carrier',  label: 'Carrier'   },
]

export function useCreateOrderPage() {
  const navigate = useNavigate()

  // --- Wizard state -------------------------------------------------------
  // PATTERN: Wizard currentStep owned by the orchestrating hook.
  // The orchestrating hook advances/retreats currentStep after validation.
  const [currentStep, setCurrentStep] = useState(0)
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null)

  // --- Step refs ----------------------------------------------------------
  // PATTERN: Step refs — identical to section refs in EditOrderPage.
  // getData() on the current step validates before Next advances.
  // All step refs are collected on Submit.
  const customerStepRef  = useRef<CustomerSectionHandle>(null)
  const addressStepRef   = useRef<AddressSectionHandle>(null)
  const orderItemsRef    = useRef<OrderItemsSectionHandle>(null)
  const carrierStepRef   = useRef<CarrierStepHandle>(null)

  // --- Dependent data loading ---------------------------------------------
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const { data: customerAddresses = [] } = useCustomerAddressesQuery(selectedCustomerId)
  const { data: products = [] } = useProductsQuery()
  const { data: carriers = [] } = useCarriersQuery()
  const { data: serviceLevels = [] } = useServiceLevelsReferenceDataQuery()
  const { createOrder, isPending: isSubmitting } = useCreateOrderMutation()

  const stepRefs = [customerStepRef, addressStepRef, orderItemsRef, carrierStepRef]

  // --- Next step ----------------------------------------------------------
  // PATTERN: Wizard Next — validate current step via getData() before advancing.
  const handleNext = async () => {
    const currentRef = stepRefs[currentStep]
    const result = await currentRef.current?.getData()

    if (!result?.isValid) {
      // The current step's Business Component has shown field-level errors.
      // Do not advance.
      return
    }

    // Capture customer selection for dependent data loading (step 0 → step 1).
    // result.data is a UNION of the step data shapes; the 'in' check narrows
    // it to the one that has customerId — no cast needed.
    if (currentStep === 0 && 'customerId' in result.data) {
      setSelectedCustomerId(result.data.customerId)
    }

    setCurrentStep(previousStep => previousStep + 1)
  }

  const handleBack = () => setCurrentStep(previousStep => Math.max(0, previousStep - 1))

  // --- Submit (final step) ------------------------------------------------
  // Collect data from all step refs and call the create mutation.
  const handleSubmit = async () => {
    // Validate the final step
    const carrierResult = await carrierStepRef.current?.getData()
    if (!carrierResult?.isValid) return

    // Collect previously validated steps (they have already been validated
    // by handleNext — we call getData() again to get the current values)
    const [customerResult, addressResult, itemsResult] = await Promise.all([
      customerStepRef.current?.getData(),
      addressStepRef.current?.getData(),
      orderItemsRef.current?.getData(),
    ])

    // TYPESCRIPT NOTE: this guard NARROWS each SectionDataResult — after it,
    // the compiler knows every result's data is present. No "!" needed below.
    if (!customerResult?.isValid || !addressResult?.isValid || !itemsResult?.isValid) {
      setPageMessage({ type: 'error', text: 'Some step data is invalid. Please go back and correct errors.' })
      return
    }

    // PATTERN: Cross-component validation (same as EditOrderPage)
    if (itemsResult.data.lineItems.length === 0) {
      setPageMessage({ type: 'error', text: 'An order must have at least one line item.' })
      return
    }

    const payload = {
      customerId: customerResult.data.customerId,
      deliveryAddress: addressResult.data,
      lineItems: itemsResult.data.lineItems,
      carrierId: carrierResult.data.carrierId,
      serviceLevel: carrierResult.data.serviceLevel,
      saturdayDelivery: carrierResult.data.saturdayDelivery,
      notifyCustomer: carrierResult.data.notifyCustomer,
    }

    createOrder(payload, {
      onSuccess: (result) => {
        // PATTERN: Action outcome → toast (cc27 / Toasts and Page Messages).
        // The toast survives the navigation to the new order's detail page.
        showSuccessToast('Order created successfully.')
        navigate(`/orders/${result.orderId}`)
      },
      onError: (error) => {
        // Action outcome (failure) → toast, same as success.
        showErrorToast(`Order creation failed: ${error.message}`)
      },
    })
  }

  return {
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
    handleCustomerChange: setSelectedCustomerId,
    // sub-object state — step refs
    customerStepRef,
    addressStepRef,
    orderItemsRef,
    carrierStepRef,
    // sub-object state — page message
    pageMessage,
    setPageMessage,
  }
}
