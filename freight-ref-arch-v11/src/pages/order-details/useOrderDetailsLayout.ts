// =============================================================================
// WHAT: Order Details layout orchestration hook
// ROLE: Logic for the Order Details LAYOUT — the persistent shell that wraps
//       the three detail tabs (Info / Line Items / Workflow).
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction / Centralised Routing):
//   The three tabs are implemented as nested routes under a layout route.
//   This layout owns only what is shared across all tabs: the order header
//   (order id, customer, date) and the top-level navigation actions
//   (Back, Edit). Each tab is its own page with its own orchestration hook.
//
//   The single-page feel is preserved as a user illusion: the layout does not
//   re-mount when switching tabs — only the <Outlet/> content changes.
//
//   "Different verb, same noun → tab": Info / Line Items / Workflow are all
//   views of the same order, so they are tabs (nested routes), not separate
//   destinations.
//
// DATA:
//   The layout fetches the order via useOrderQuery for the header. Each tab
//   page also fetches the order via useOrderQuery. TanStack Query dedupes
//   these into a single network request (same query key), so the extra calls
//   are effectively free. This keeps every route fully self-contained — each
//   asks the server for exactly what it needs and depends on nothing passed in.
// =============================================================================

import { useParams, useNavigate } from 'react-router'
import { useOrderQuery } from '@/shared/data/orderDataHooks'
import { ORDER_DETAIL_TAB_PATHS } from './orderDetailTabPaths'

// Tab definitions for Level 2 navigation. Labels live here; the path slugs come
// from the single source of truth in orderDetailTabPaths.ts (shared with the
// router), so a tab's link and its route can never drift apart.
export const ORDER_DETAIL_TABS = [
  { label: 'Order Info', path: ORDER_DETAIL_TAB_PATHS.info      },
  { label: 'Line Items', path: ORDER_DETAIL_TAB_PATHS.lineItems },
  { label: 'Workflow',   path: ORDER_DETAIL_TAB_PATHS.workflow  },
]

export function useOrderDetailsLayout() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()

  // Fetch the order for the header. Deduped with the tab pages' own fetches.
  const { data: order, isPending: isLoading, isError } = useOrderQuery(orderId)

  // PATTERN: action availability follows availableActions, never role. The
  // Edit button shows iff the server lists 'edit' among the order's actions —
  // the same rule the edit page uses for canEdit (cc26 / Security and Permissions).
  const canEdit = order?.availableActions.includes('edit') ?? false

  const handleEdit = () => navigate(`/orders/${orderId}/edit`)
  const handleBack = () => navigate('/orders')

  return {
    // identity
    orderId,
    // data
    order,
    // status flags
    isLoading,
    isError,
    // derived booleans
    canEdit,
    // handlers
    handleEdit,
    handleBack,
  }
}
