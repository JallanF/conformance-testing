// =============================================================================
// WHAT: Page-local components for the Order Info tab page
// ROLE: All components used only by the Order Info tab, bundled in the
//       page's single [PageName]Components.tsx file (cc27 / Frontend Structure).
//
// COMPONENTS IN THIS FILE:
//   OrderInfoSection        — read-only order metadata display
//   ApprovalSection         — conditional section (requiresApproval)
//   FinancialSummarySection — presence-driven financials display
// =============================================================================

import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DetailField } from '@/shared/technical-components/DetailField'
import { DetailGrid } from '@/shared/technical-components/DetailGrid'
import { SectionCard } from '@/shared/technical-components/SectionCard'
import { OrderStatusBadge } from '@/shared/business-components/OrderStatusBadge'
import { formatDate } from '@/shared/utils/formatDate'
import type { Order, OrderFinancials } from '@/shared/contracts/orderContracts'

// =============================================================================
// WHAT: OrderInfoSection — Business Component
// ROLE: Read-only display of core order metadata (status, customer, date,
//       warehouse, ordered-by). Extracted from the Order Info tab so the tab
//       page composes named components rather than holding inline JSX.
//
// DISPLAY-ONLY: No form, no pull pattern — it only renders order fields.
// =============================================================================

interface OrderInfoSectionProps {
  order: Order
}

export function OrderInfoSection({ order }: OrderInfoSectionProps) {
  return (
    <SectionCard title="Order Details">
      <DetailGrid>
        <DetailField label="Status">
          <OrderStatusBadge status={order.status} />
        </DetailField>
        <DetailField label="Customer">{order.customerName}</DetailField>
        <DetailField label="Order Date">{formatDate(order.orderDate)}</DetailField>
        <DetailField label="Warehouse">{order.warehouseLocation}</DetailField>
        <DetailField label="Ordered By">{order.orderedBy}</DetailField>
      </DetailGrid>
    </SectionCard>
  )
}

// =============================================================================
// WHAT: ApprovalSection — Business Component (display-only)
// ROLE: Displays the approval requirement and any recorded approval notes when
//       an order requires approval. Demonstrates CONDITIONAL SECTION RENDERING.
//
// CONDITIONAL SECTION (cc27 / State Management / Visibility Levels):
//   This section only renders when showApprovalSection = true.
//   showApprovalSection is derived in the Page orchestration hook:
//     const showApprovalSection = order?.requiresApproval === true
//   It is passed as a prop to the Page JSX, which conditionally renders:
//     {showApprovalSection && <ApprovalSection ... />}
//
// DISPLAY-ONLY: No form, no ref contract, no pull pattern. Approving an order
//   is a workflow ACTION and happens on the Workflow tab — this section only
//   tells the reader of the Info tab that approval is required.
// =============================================================================

interface ApprovalSectionProps {
  notes?: string
}

export function ApprovalSection({ notes = '' }: ApprovalSectionProps) {
  return (
    <SectionCard
      title="Approval Required"
      hint="This order has been flagged as requiring manager approval before dispatch."
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">Approval notes</span>
        <p className="text-sm text-muted-foreground">
          {notes || 'No approval notes recorded.'}
        </p>
      </div>
    </SectionCard>
  )
}

// =============================================================================
// WHAT: FinancialSummarySection — Business Component
// ROLE: Displays order financials (subtotal, tax, total, margin).
//       Demonstrates presence-driven field visibility.
//
// PRESENCE-DRIVEN FIELD VISIBILITY (cc26 / Security and Permissions):
//   The margin field is shown iff the server SENT marginPercent. The backend
//   omits it for users who may not see it (e.g. admins see financials without
//   the margin). This component never reads a role or a boolean prop — it
//   renders each field on the presence of its data.
//
// NOTE: This is a READ-ONLY section. No edit mode. No pull pattern needed.
// =============================================================================

interface FinancialSummarySectionProps {
  financials?: OrderFinancials
}

export function FinancialSummarySection({ financials }: FinancialSummarySectionProps) {
  if (!financials) return null

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`

  return (
    <SectionCard title="Financial Summary">
      <DetailGrid>
        {/* tabular-nums: equal-width digits so the currency values align. */}
        <DetailField label="Subtotal" valueClassName="tabular-nums">{formatCurrency(financials.subtotal)}</DetailField>
        <DetailField label="GST (10%)" valueClassName="tabular-nums">{formatCurrency(financials.tax)}</DetailField>
        <DetailField label="Total" valueClassName="font-bold tabular-nums">
          {formatCurrency(financials.total)}
        </DetailField>

        {/* PATTERN: Presence-driven field visibility — the margin row renders
            iff the server sent marginPercent. No role, no boolean prop.
            The margin VALUE chooses its emphasis class (data-driven class
            rule) — warning below 20%, success otherwise (D17 tokens). */}
        {financials.marginPercent != null && (
          <DetailField
            label="Margin"
            valueClassName={financials.marginPercent < 20 ? 'text-warning' : 'text-success'}
          >
            {financials.marginPercent}%
            {/* PATTERN: ui/tooltip — supplementary explanation on hover/focus.
                The trigger renders AS a button wrapping the icon (render
                prop); TooltipProvider is mounted once in App.tsx. */}
            <Tooltip>
              <TooltipTrigger
                render={<button type="button" aria-label="About margin" className="ml-1 align-middle text-muted-foreground hover:text-foreground" />}
              >
                <Info className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>
                Margin is calculated by the server from catalogue costs.
                Below 20% renders as a warning.
              </TooltipContent>
            </Tooltip>
          </DetailField>
        )}
      </DetailGrid>
    </SectionCard>
  )
}
