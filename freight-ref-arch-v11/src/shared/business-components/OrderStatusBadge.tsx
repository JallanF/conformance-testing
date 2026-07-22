// =============================================================================
// WHAT: OrderStatusBadge — shared Business Component (display-only)
// ROLE: Renders an order's status as a coloured badge. Knows the OrderStatus
//       domain vocabulary (labels + intent colour per status).
//
// GRADUATION (cc27 / Frontend Structure): the status badge started page-local
// in OrderSearchComponents; the Order Info tab needed the identical rendering,
// so it graduated to shared/business-components (used by more than one page).
//
// DATA-DRIVEN CLASS RULE (cc27 / Styling): the status value chooses the
// class; the classes are built on the RA's semantic intent tokens
// (--success/--warning/--info, DECISIONS-LOG D17).
//
// DISPLAY-ONLY Business Component: props in, no form state, no pull pattern.
// =============================================================================

import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/shared/contracts/orderContracts'

// TYPESCRIPT NOTE — Record<K, V>:
//   Record<OrderStatus, string> means "an object with a key for EVERY possible
//   OrderStatus value". Because OrderStatus is a union of fixed values,
//   TypeScript errors if a status is missing here — a compile-time guarantee
//   that every status has badge classes and a label.
const STATUS_CLASS: Record<OrderStatus, string> = {
  pending:    'bg-warning/10 text-warning',
  approved:   'bg-success/10 text-success',
  dispatched: 'bg-info/10 text-info',
  cancelled:  'bg-muted text-muted-foreground',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    'Pending',
  approved:   'Approved',
  dispatched: 'Dispatched',
  cancelled:  'Cancelled',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={STATUS_CLASS[status] ?? ''}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  )
}
