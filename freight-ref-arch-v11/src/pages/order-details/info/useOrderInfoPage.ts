// =============================================================================
// WHAT: Order Info tab orchestration hook
// ROLE: Logic for the Order Info tab — read-only order metadata, delivery
//       address, conditional approval section, and presence-driven financials.
//
// SELF-CONTAINED ROUTE:
//   This tab is a nested route under the Order Details layout. It fetches the
//   order itself via useOrderQuery (deduped with the layout's fetch), so it
//   depends on nothing passed in. It owns only its own concerns.
//
// PATTERNS DEMONSTRATED:
//   • Presence-driven visibility — the FE renders the financials section iff
//     the server sent order.financials. NO role check: the server suppresses
//     the data for users who may not see it, and the FE renders what it gets.
//   • Conditional section visibility — showApprovalSection derived from order
//     data (requiresApproval). Null ref behaviour applies when hidden.
//
//   Note there is no AuthContext read here at all. Permission logic lives on
//   the server (cc26 / Security and Permissions); the FE reads data presence.
// =============================================================================

import { useParams } from 'react-router'
import { useOrderQuery } from '@/shared/data/orderDataHooks'

export function useOrderInfoPage() {
  const { orderId = '' } = useParams()

  const { data: order, isPending: isLoading, isError } = useOrderQuery(orderId)

  // PATTERN: Section visibility derived from server data.
  const showApprovalSection = order?.requiresApproval === true

  return {
    // data
    order,
    // status flags
    isLoading,
    isError,
    // derived booleans
    showApprovalSection,
  }
}
