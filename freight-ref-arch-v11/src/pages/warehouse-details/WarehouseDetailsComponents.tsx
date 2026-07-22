// =============================================================================
// WHAT: Page-local components for the Warehouse Details page
// ROLE: All components used only by the Warehouse Details page, bundled in the
//       page's single [PageName]Components.tsx file (cc27 / Frontend Structure).
//
// COMPONENTS IN THIS FILE:
//   WarehouseStatusBadge  — status badge (page-local display component)
//   AllocationsGrid       — Business Component (allocation columns, wraps DataGrid)
//   PremiumStorageSection — conditional read-only section
//   AddAllocationModal    — Type B modal with internal wizard (pull pattern)
// =============================================================================

import { useImperativeHandle, useState, type Ref } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataGrid, type GridColumn } from '@/shared/technical-components/DataGrid'
import { DetailField } from '@/shared/technical-components/DetailField'
import { DetailGrid } from '@/shared/technical-components/DetailGrid'
import { FormRow } from '@/shared/technical-components/FormRow'
import { SectionCard } from '@/shared/technical-components/SectionCard'
import { WizardChrome } from '@/shared/technical-components/WizardChrome'
import type { SectionDataResult } from '@/shared/types/sectionDataResult'
import type { Allocation, AllocationPriority, AddAllocationPayload } from './warehouseDetailsTypes'

// =============================================================================
// WHAT: WarehouseStatusBadge — page-local display component
// ROLE: Renders the warehouse's status as a coloured badge. Page-local (only
//       this page shows a warehouse status); would graduate to shared/ if a
//       second page needed it — exactly how OrderStatusBadge started.
// =============================================================================

// The data chooses the class (cc27 / Styling) — D17 semantic tokens.
// Keyed by string because the page-owned Warehouse type carries status as a
// plain string (matching the previous badge--${status} class selection).
const WAREHOUSE_STATUS_CLASS: Record<string, string> = {
  active:   'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
}

export function WarehouseStatusBadge({ status }: { status: string }) {
  return (
    <Badge className={`uppercase ${WAREHOUSE_STATUS_CLASS[status] ?? ''}`}>
      {status}
    </Badge>
  )
}

// =============================================================================
// WHAT: AllocationsGrid — Business Component
// ROLE: Renders the warehouse allocations grid. Knows the Allocation type
//       and allocation-specific column definitions. Wraps DataGrid.
//       Handles presence-driven column visibility (cost fields).
// =============================================================================

// Priority badge classes — intent-mapped onto the D17 semantic tokens
// (normal: neutral, high: warning, critical: destructive).
const PRIORITY_CLASS: Record<AllocationPriority, string> = {
  normal:   'bg-muted text-muted-foreground',
  high:     'bg-warning/10 text-warning',
  critical: 'bg-destructive/10 text-destructive',
}

interface AllocationsGridProps {
  allocations: Allocation[]
  showCostFields: boolean           // Presence-derived prop from orchestration hook
  onRemove: (allocationId: string) => void
  isLoading?: boolean
}

export function AllocationsGrid({ allocations, showCostFields, onRemove, isLoading }: AllocationsGridProps) {
  // RULE: every sortable column declares sortValue — the RAW value to sort by
  // (see GridColumn.sortValue). Quantity sorts numerically via the raw number;
  // its DISPLAYED form ("1,000") would sort as text.
  const columns: GridColumn<Allocation>[] = [
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortValue: (row) => row.category,
      render: (row) => row.category,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      sortValue: (row) => row.quantity,
      render: (row) => row.quantity.toLocaleString(),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      sortValue: (row) => row.priority,
      render: (row) => (
        <Badge className={`uppercase ${PRIORITY_CLASS[row.priority] ?? ''}`}>
          {row.priority}
        </Badge>
      ),
    },
    {
      key: 'storageZone',
      header: 'Zone',
      sortable: true,
      sortValue: (row) => row.storageZone,
      render: (row) => row.storageZone,
    },
    // PATTERN: Presence-driven column visibility
    // showCostFields was derived from data PRESENCE in the orchestration hook
    // (the server omits cost data for users without visibility). This component
    // receives it as a prop — it never reads a role or AuthContext.
    ...(showCostFields ? [
      {
        key: 'costPerUnit',
        header: 'Cost / Unit',
        sortable: false,
        render: (row: Allocation) => row.costPerUnit != null ? `$${row.costPerUnit.toFixed(2)}` : '—',
      },
      {
        key: 'totalValue',
        header: 'Total Value',
        sortable: false,
        render: (row: Allocation) => row.totalValue != null ? `$${row.totalValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}` : '—',
      },
    ] as GridColumn<Allocation>[] : []),
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (row) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={(event) => { event.stopPropagation(); onRemove(row.allocationId) }}
        >
          Remove
        </Button>
      ),
    },
  ]

  return (
    <DataGrid
      columns={columns}
      data={allocations}
      keyExtractor={(row) => row.allocationId}
      isLoading={isLoading}
      emptyMessage="No allocations found for this warehouse."
    />
  )
}

// =============================================================================
// WHAT: PremiumStorageSection — Business Component (read-only)
// ROLE: Displays premium storage information. Only rendered when the warehouse
//       has hasPremiumStorage = true. Demonstrates conditional section pattern.
// =============================================================================

interface PremiumStorageSectionProps {
  // showCostFields is a presence-derived prop (see the page hook). This component never reads auth state.
  showCostFields: boolean
  allocations: Allocation[]
}

export function PremiumStorageSection({ showCostFields, allocations }: PremiumStorageSectionProps) {
  const premiumAllocations = allocations.filter(allocation => allocation.storageZone === 'Premium Zone')

  return (
    <SectionCard
      title="Premium Storage"
      titleAside={<Badge className="bg-success/10 text-success uppercase">Active</Badge>}
      hint="This warehouse has a premium temperature-controlled storage zone. Items in the Premium Zone are stored under strict environmental conditions."
    >
      {premiumAllocations.length > 0 ? (
        <DetailGrid>
          {premiumAllocations.map(allocation => (
            <DetailField key={allocation.allocationId} label={allocation.category}>
              {allocation.quantity} units
              {showCostFields && allocation.totalValue != null && (
                <span className="block text-xs text-muted-foreground">
                  Value: ${allocation.totalValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                </span>
              )}
            </DetailField>
          ))}
        </DetailGrid>
      ) : (
        <p className="text-sm text-muted-foreground">No items currently in Premium Zone.</p>
      )}
    </SectionCard>
  )
}

// =============================================================================
// WHAT: AddAllocationModal — Business Component (Modal Type B)
// ROLE: A 2-step allocation form inside a modal. Follows the full pull pattern.
//       Demonstrates MODAL TYPE B: a Business Component with getData/reset/isDirty
//       that lives inside a modal container.
//
// MODAL TYPE B vs TYPE A (cc27 / Screen Composition / Modal Types):
//   Type A — ConfirmationModal: no data, no form, no pull pattern
//   Type B — AddAllocationModal (this): has a form, uses pull pattern
//            The parent hook calls getData() on the modal's ref to collect data.
//
// IMPLEMENTATION — ui/dialog (Base UI Dialog underneath):
//   - CONTROLLED: the hook's is…ModalOpen drives the open prop; no Trigger.
//   - Escape closes: Base UI raises onOpenChange(false) → mapped to onCancel
//     (the hand-written keydown listener of earlier versions is gone).
//   - Backdrop click must NOT dismiss (an accidental click must never discard
//     entered data — cc27 / Modal Types): disablePointerDismissal on the Root.
//   - MOUNTING: this COMPONENT stays mounted (the page renders it
//     unconditionally), so its useForm state and its ref survive open/close.
//     Only the dialog POPUP unmounts when closed (Base UI default) — the same
//     behaviour as the previous implementation, which returned null when
//     closed. No keepMounted is needed for Type B modals; keepMounted matters
//     where a whole Business Component lives inside a collapsing container.
//
// NOTE ON WIZARD INSIDE MODAL:
//   This component also demonstrates the modal-level wizard:
//   the form is split into 2 steps, managed internally by this component.
//   The parent Page only sees the pull pattern interface — it does not know
//   the form has multiple steps. Step panels here render conditionally —
//   safe, because the FIELD VALUES live in this component's useForm (RHF
//   retains values for unmounted inputs), not in per-step components.
// =============================================================================

export interface AddAllocationModalHandle {
  getData(): Promise<SectionDataResult<AddAllocationPayload>>
  reset(): void
  isDirty(): boolean
}

const MODAL_WIZARD_STEPS = [
  { id: 'details', label: 'Details'  },
  { id: 'zone',    label: 'Storage'  },
]

const STORAGE_ZONES = ['Zone A', 'Zone B', 'Zone C', 'Premium Zone']

const PRIORITY_OPTIONS = [
  { value: 'normal',   label: 'Normal'   },
  { value: 'high',     label: 'High'     },
  { value: 'critical', label: 'Critical' },
]

interface AddAllocationModalProps {
  ref?: Ref<AddAllocationModalHandle>
  isOpen: boolean
  // Read-only context shown at the top of the dialog (which warehouse the
  // allocation is being added to).
  warehouseName: string
  warehouseType: string
  onSubmit: () => void   // Page calls getData() on ref, then calls this
  onCancel: () => void
}

type AllocationFormValues = AddAllocationPayload

// BUSINESS COMPONENT — Type B modal with pull pattern + internal wizard.
export function AddAllocationModal({ ref, isOpen, warehouseName, warehouseType, onSubmit, onCancel }: AddAllocationModalProps) {
  // PATTERN: Modal-level wizard — currentStep is internal to this component.
  // The parent (Page) doesn't know this is a wizard — it just calls getData().
  const [currentStep, setCurrentStep] = useState(0)

  const {
    register,
    control,
    trigger,
    reset: resetForm,
    getValues,
    formState: { errors, isDirty: formIsDirty },
  } = useForm<AllocationFormValues>({
    defaultValues: { category: '', quantity: 1, priority: 'normal', storageZone: '' },
  })

  // PATTERN: Pull pattern on a modal Business Component.
  // The orchestration hook calls this after the user clicks the modal's submit.
  useImperativeHandle(ref, () => ({
    async getData(): Promise<SectionDataResult<AddAllocationPayload>> {
      const isValid = await trigger()
      if (!isValid) return { isValid: false, data: null }
      return { isValid: true, data: getValues() }
    },
    reset() {
      resetForm({ category: '', quantity: 1, priority: 'normal', storageZone: '' })
      setCurrentStep(0)
    },
    isDirty() { return formIsDirty },
  }))

  // Internal wizard Next — validate current step's fields only
  const handleNext = async () => {
    const fieldsToValidate: Array<keyof AllocationFormValues> =
      currentStep === 0 ? ['category', 'quantity', 'priority'] : ['storageZone']
    const isValid = await trigger(fieldsToValidate)
    if (isValid) setCurrentStep(1)
  }

  return (
    <Dialog
      open={isOpen}
      // Escape (and the corner close button) raise open=false → 'cancelled'.
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
      // RA rule: clicking the dark backdrop must NOT dismiss a data-entry
      // modal — an accidental click must never discard entered data.
      disablePointerDismissal
    >
      <DialogContent className="sm:max-w-xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add Allocation</DialogTitle>
        </DialogHeader>

        {/* Read-only context recap — which warehouse this allocation joins.
            It also DEMONSTRATES container queries (cc27 / Styling): this is the
            SAME DetailGrid used full-width on the Order Info tab, but here it
            sits in the NARROW dialog, so it renders single-column — the grid
            responds to its container's width, not the viewport's. */}
        <DetailGrid>
          <DetailField label="Warehouse">{warehouseName}</DetailField>
          <DetailField label="Type">{warehouseType}</DetailField>
        </DetailGrid>

        {/* PATTERN: Modal-level wizard using shared WizardChrome */}
        <WizardChrome
          steps={MODAL_WIZARD_STEPS}
          currentStep={currentStep}
          onBack={() => setCurrentStep(0)}
          onNext={handleNext}
          onSubmit={onSubmit}
        >
          {currentStep === 0 && (
            <div>
              <FormRow>
                <Field data-invalid={!!errors.category}>
                  <FieldLabel htmlFor="allocation-category">Category</FieldLabel>
                  <Input
                    id="allocation-category"
                    placeholder="e.g. Industrial Bearings"
                    aria-invalid={!!errors.category}
                    {...register('category', { required: 'Category is required' })}
                  />
                  <FieldError errors={[errors.category]} />
                </Field>
                <Field data-invalid={!!errors.quantity}>
                  <FieldLabel htmlFor="allocation-quantity">Quantity</FieldLabel>
                  <Input
                    id="allocation-quantity"
                    type="number"
                    min={1}
                    aria-invalid={!!errors.quantity}
                    {...register('quantity', { required: true, min: 1, valueAsNumber: true })}
                  />
                  {errors.quantity && (
                    <FieldError>Quantity must be at least 1</FieldError>
                  )}
                </Field>
              </FormRow>
              <FormRow>
                {/* PATTERN: a RADIO GROUP in an RHF form — same rule as selects:
                    a Base UI control (value/onValueChange), so it connects
                    through Controller (cc27 / Selects and Controlled Inputs).
                    Radio suits priority: 3 mutually-exclusive options, all
                    visible at once — no popup needed. */}
                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Priority</FieldLabel>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => field.onChange(value ?? 'normal')}
                        className="flex gap-6"
                      >
                        {/* The label WRAPS the radio — implicit association;
                            no htmlFor/id pair needed (Base UI generates its
                            own internal ids). */}
                        {PRIORITY_OPTIONS.map(priorityOption => (
                          <label
                            key={priorityOption.value}
                            className="flex items-center gap-2 text-sm"
                          >
                            <RadioGroupItem value={priorityOption.value} />
                            {priorityOption.label}
                          </label>
                        ))}
                      </RadioGroup>
                    </Field>
                  )}
                />
              </FormRow>
            </div>
          )}

          {currentStep === 1 && (
            <FormRow>
              {/* PATTERN: selects in RHF forms use Controller (cc27). */}
              <Controller
                name="storageZone"
                control={control}
                rules={{ required: 'Please select a storage zone' }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="allocation-zone">Storage Zone</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? '')}
                      items={STORAGE_ZONES.map(zone => ({ value: zone, label: zone }))}
                      inputRef={field.ref}
                    >
                      <SelectTrigger
                        id="allocation-zone"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                        onBlur={field.onBlur}
                      >
                        <SelectValue placeholder="— select zone —" />
                      </SelectTrigger>
                      <SelectContent>
                        {STORAGE_ZONES.map(zone => (
                          <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FormRow>
          )}
        </WizardChrome>

        {/* Cancel button outside the wizard chrome */}
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
