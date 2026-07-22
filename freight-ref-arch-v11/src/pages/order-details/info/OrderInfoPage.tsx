// =============================================================================
// WHAT: Order Info tab page (nested route under Order Details)
// ROLE: Read-only order metadata, delivery address, conditional approval
//       section, presence-driven financials. JSX and layout only.
// =============================================================================

import { AddressSection } from '@/shared/business-components/AddressSection'
import { PageStatus } from '@/shared/technical-components/PageStatus'
import { useOrderInfoPage } from './useOrderInfoPage'
import { OrderInfoSection, ApprovalSection, FinancialSummarySection } from './OrderInfoComponents'

export function OrderInfoPage() {
  const {
    // data
    order,
    // status flags
    isLoading,
    isError,
    // derived booleans
    showApprovalSection,
  } = useOrderInfoPage()

  // The layout has already loaded the order; these guards are defensive
  // for the (deduped) refetch and keep this route self-contained.
  if (isLoading) {
    return <PageStatus message="Loading…" />
  }
  if (isError || !order) {
    return <PageStatus message="Order could not be loaded." />
  }

  return (
    <>
      {/* Order metadata — read-only display fields */}
      <OrderInfoSection order={order} />

      {/* SHARED BUSINESS COMPONENT: AddressSection (read-only mode) */}
      <AddressSection
        initialAddress={order.deliveryAddress}
        canEdit={false}
        title="Delivery Address"
      />

      {/* PATTERN: Conditional section — shown only when requiresApproval is true. */}
      {showApprovalSection && (
        <ApprovalSection />
      )}

      {/* PATTERN: Data suppression → presence. The server omits financials for
          users without permission; the FE renders the section iff they are
          present. No role check anywhere. */}
      {order.financials && (
        <FinancialSummarySection financials={order.financials} />
      )}
    </>
  )
}
