// =============================================================================
// WHAT: Warehouse Details page
// ROLE: Displays a single warehouse with its allocations, address, and
//       premium storage section. Demonstrates the most patterns per page:
//       component-level wizard, modal Type B, shared Business Component reuse,
//       conditional sections, and presence-driven column visibility.
//
// RECOMMENDED READING ORDER FOR THIS PAGE:
//   1. useWarehouseDetailsPage.ts — all the logic (read this first)
//   2. WarehouseDetailsComponents.tsx — the Business Components rendered here
//      - AllocationsGrid          — grid with presence-driven columns
//      - PremiumStorageSection    — conditional section
//      - AddAllocationModal       — Type B modal with internal wizard
//   3. shared/business-components/AddressSection.tsx — shared Business Component
//   4. This file — see how JSX assembles them with minimal logic
// =============================================================================

import { Button } from '@/components/ui/button'
import { AddressSection } from '@/shared/business-components/AddressSection'
import { ConfirmationModal } from '@/shared/technical-components/ConfirmationModal'
import { PageContent } from '@/shared/technical-components/PageContent'
import { SectionCard } from '@/shared/technical-components/SectionCard'
import { PageStatus } from '@/shared/technical-components/PageStatus'
import { useWarehouseDetailsPage } from './useWarehouseDetailsPage'
import {
  AllocationsGrid,
  PremiumStorageSection,
  AddAllocationModal,
  WarehouseStatusBadge,
} from './WarehouseDetailsComponents'

// PAGE: JSX and layout only.
export function WarehouseDetailsPage() {
  const {
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
    handleRequestAddAllocation,
    handleSubmitNewAllocation,
    handleCancelAddAllocation,
    // sub-object state — remove-allocation confirmation
    isRemoveConfirmationModalOpen,
    handleRequestRemoveAllocation,
    handleConfirmRemoveAllocation,
    handleCancelRemoveAllocation,
  } = useWarehouseDetailsPage()

  if (isLoading) {
    return <PageContent><PageStatus message="Loading warehouse…" /></PageContent>
  }

  if (isError || !warehouse) {
    return (
      <PageContent>
        <PageStatus title="Warehouse not found" message={`Warehouse ${warehouseId} could not be loaded.`} />
      </PageContent>
    )
  }

  return (
    <PageContent>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{warehouse.name}</h1>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            {warehouse.warehouseId} · {warehouse.type}
            <WarehouseStatusBadge status={warehouse.status} />
          </span>
        </div>
        <Button onClick={handleRequestAddAllocation}>
          + Add Allocation
        </Button>
      </div>

      {/* Action outcomes (allocation added/removed) appear as toasts, fired by
          the orchestration hook — no PageMessage on this page. */}

      {/* SHARED BUSINESS COMPONENT: AddressSection reused in warehousing feature.
          Same component used in orders (delivery address) — demonstrates shared
          Business Component in shared/business-components/. Read-only mode here. */}
      <AddressSection
        initialAddress={warehouse.address}
        canEdit={false}
        title="Warehouse Address"
      />

      {/* PATTERN: Conditional section
          showPremiumStorage = warehouse.hasPremiumStorage (derived in hook from server data).
          If the warehouse has no premium storage, this section is not rendered at all. */}
      {showPremiumStorage && (
        <PremiumStorageSection
          showCostFields={showCostFields}
          allocations={warehouse.allocations}
        />
      )}

      {/* Allocations section with grid */}
      <SectionCard
        title="Allocations"
        titleAside={
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {warehouse.allocations.length} allocation{warehouse.allocations.length !== 1 ? 's' : ''}
          </span>
        }
      >
        {/* BUSINESS COMPONENT: AllocationsGrid
            showCostFields is presence-derived (comes from the orchestration hook, not AuthContext).
            onRemove raises an event to this Page, which raises to the orchestration hook. */}
        <AllocationsGrid
          allocations={warehouse.allocations}
          showCostFields={showCostFields}
          onRemove={handleRequestRemoveAllocation}
        />
      </SectionCard>

      {/* PATTERN: Type B modal — Business Component inside a modal.
          The modal has a ref (addModalRef). When the user submits, the Page
          orchestration hook calls getData() on that ref to collect data,
          then calls the addAllocation mutation.
          The modal internally contains a 2-step wizard (modal-level wizard). */}
      <AddAllocationModal
        ref={addModalRef}
        isOpen={isAddAllocationModalOpen}
        warehouseName={warehouse.name}
        warehouseType={warehouse.type}
        onSubmit={handleSubmitNewAllocation}
        onCancel={handleCancelAddAllocation}
      />

      {/* PATTERN: Type A confirmation modal — remove allocation */}
      <ConfirmationModal
        isOpen={isRemoveConfirmationModalOpen}
        title="Remove Allocation"
        message="Are you sure you want to remove this allocation? This action cannot be undone."
        confirmLabel="Remove"
        isDangerous={true}
        onConfirm={handleConfirmRemoveAllocation}
        onCancel={handleCancelRemoveAllocation}
      />
    </PageContent>
  )
}
