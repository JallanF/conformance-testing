// =============================================================================
// WHAT: AddressSection — shared Business Component
// ROLE: Displays and optionally edits an address. Used by both OrderDetailsPage
//       (delivery address) and WarehouseDetailsPage (warehouse address).
//
// PLACEMENT NOTE:
//   This Business Component lives in shared/business-components/ — not in a specific
//   feature — because it is genuinely reused across multiple features.
//   Most Business Components live in their feature's components/ folder.
//   Those that cross feature boundaries move to shared/business-components/.
//   This is documented in cc27 / Frontend Structure: "Prefer a single authoritative shared
//   definition whenever a concept is clearly shared across the application."
//
// PULL PATTERN (cc27 / Screen Composition / Business Component Ref Contract):
//   This component follows the full pull pattern when canEdit = true:
//     getData()  → validates and returns the edited ADDRESS FIELDS
//     reset()    → resets form to initial values
//     isDirty()  → returns true if the user has changed any field
//
//   getData() returns AddressFields — the values the user actually edited.
//   It never returns addressId or label: the server owns record identity, so
//   the client never sends (let alone invents) one. See addressContracts.ts.
//
//   When canEdit = false (read-only mode), it renders display fields only;
//   a pull still works and returns the unchanged initial field values.
//
//   The ref contract (AddressSectionHandle) is defined here so the consuming
//   Page orchestration hook can type its ref correctly.
//
// ADDRESS SELECTOR:
//   When addresses are provided (from a customer address fetch), a dropdown
//   allows the user to select a pre-loaded address. This demonstrates the
//   dependent data loading pattern: the Page loads addresses when a customer
//   is selected and passes them here as the `addresses` prop.
//   The picker is NOT part of the RHF form (its choice merely populates the
//   form via setValue), so it is a plain ui/select — uncontrolled, no
//   Controller — the same distinction as filter-bar selects (cc27 / Selects
//   and Controlled Inputs).
//
// FIELD MARKUP (cc27 / Styling): each input sits in a Field wrapper —
//   FieldLabel, ui/input via register() (native inputs use register; see
//   DECISIONS-LOG D14), FieldError. data-invalid on Field + aria-invalid on
//   the control drive the error presentation.
//
// SEE ALSO:
//   shared/data/selectorDataHooks.ts        — fetches customer addresses
//   pages/edit-order/useEditOrderPage.ts     — dependent data loading
// =============================================================================

import { useImperativeHandle, type Ref } from 'react'
import { useForm } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DetailField } from '@/shared/technical-components/DetailField'
import { DetailGrid } from '@/shared/technical-components/DetailGrid'
import { FormRow } from '@/shared/technical-components/FormRow'
import { SectionCard } from '@/shared/technical-components/SectionCard'
import type { Address, AddressFields } from '@/shared/contracts/addressContracts'
import type { SectionDataResult } from '@/shared/types/sectionDataResult'

// PATTERN: Component ref contract
// This type is exported so Page orchestration hooks can type their refs:
//   const addressRef = useRef<AddressSectionHandle>(null)
// getData() returns SectionDataResult — a discriminated union, so callers
// that check isValid get data without any "!" assertions.
export interface AddressSectionHandle {
  getData(): Promise<SectionDataResult<AddressFields>>
  reset(): void
  isDirty(): boolean
}

interface AddressSectionProps {
  ref?: Ref<AddressSectionHandle>
  initialAddress?: Address | null
  // Pre-loaded address options (from dependent data loading)
  addresses?: Address[]
  canEdit?: boolean
  title?: string
}

// The form edits exactly the AddressFields shape — the …FormValues alias
// follows the naming convention for React Hook Form value shapes (cc27).
type AddressFormValues = AddressFields

// BUSINESS COMPONENT — owns its editing state via React Hook Form.
// Exposes getData/reset/isDirty to parent via ref.
export function AddressSection({
  ref,
  initialAddress,
  addresses = [],
  canEdit = false,
  title = 'Address',
}: AddressSectionProps) {
  // REACT HOOK FORM (RHF) — useForm() returns a set of tools for managing
  // this component's form. The ones we use here:
  //   register    — connects an <input> to the form (tracks its value/validation)
  //   trigger     — runs validation on all fields; returns a Promise<boolean>
  //   reset       — restores the form to given values (we alias it resetForm)
  //   getValues   — reads the current field values without re-rendering
  //   setValue    — programmatically sets a field's value
  //   formState   — form status; here we read validation errors and isDirty
  //                 (isDirty = has the user changed anything since last reset)
  const {
    register,
    trigger,
    reset: resetForm,
    getValues,
    setValue,
    formState: { errors, isDirty: formIsDirty },
  } = useForm<AddressFormValues>({
    defaultValues: {
      street: initialAddress?.street ?? '',
      city: initialAddress?.city ?? '',
      state: initialAddress?.state ?? '',
      postcode: initialAddress?.postcode ?? '',
      country: initialAddress?.country ?? 'Australia',
    },
  })

  // PATTERN: Pull pattern via useImperativeHandle (React 19 — ref as plain prop)
  // The parent Page orchestration hook calls these methods on the ref.
  // getData() is async because React Hook Form's trigger() is async
  // (it runs all validators, including async ones, before returning).
  useImperativeHandle(ref, () => ({
    // Returns the edited AddressFields — and nothing more. No fabricated
    // addressId/label: the server owns record identity (see addressContracts.ts).
    async getData(): Promise<SectionDataResult<AddressFields>> {
      const isValid = await trigger()
      if (!isValid) return { isValid: false, data: null }
      return { isValid: true, data: getValues() }
    },

    reset() {
      resetForm({
        street: initialAddress?.street ?? '',
        city: initialAddress?.city ?? '',
        state: initialAddress?.state ?? '',
        postcode: initialAddress?.postcode ?? '',
        country: initialAddress?.country ?? 'Australia',
      })
    },

    isDirty() {
      return formIsDirty
    },
  }))

  // PATTERN: Dependent data loading
  // When a new address is selected from the dropdown, the form fields are
  // populated from the selected address. The parent Page orchestration hook
  // provides the `addresses` array — it fetched them when the customer changed.
  const handleAddressSelect = (addressId: string | null) => {
    const selected = addresses.find(address => address.addressId === addressId)
    if (selected) {
      setValue('street', selected.street, { shouldDirty: true })
      setValue('city', selected.city, { shouldDirty: true })
      setValue('state', selected.state, { shouldDirty: true })
      setValue('postcode', selected.postcode, { shouldDirty: true })
      setValue('country', selected.country, { shouldDirty: true })
    }
  }

  return (
    <SectionCard title={title}>
      {/* Address selector — only shown when pre-loaded addresses are available.
          Plain ui/select, uncontrolled (defaultValue), no Controller: it is a
          picker outside the RHF form; its choice populates the form fields. */}
      {canEdit && addresses.length > 0 && (
        <div className="mb-4 flex flex-col gap-1.5">
          <FieldLabel htmlFor="saved-address-select">Select saved address</FieldLabel>
          <Select
            defaultValue=""
            onValueChange={handleAddressSelect}
            items={[
              { value: '', label: '— choose a saved address or enter manually —' },
              ...addresses.map(address => ({
                value: address.addressId,
                label: `${address.label} — ${address.street}, ${address.city}`,
              })),
            ]}
          >
            <SelectTrigger id="saved-address-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">— choose a saved address or enter manually —</SelectItem>
              {addresses.map(address => (
                <SelectItem key={address.addressId} value={address.addressId}>
                  {address.label} — {address.street}, {address.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {canEdit ? (
        // Edit mode — React Hook Form fields (register: native inputs, D14)
        <>
          <FormRow>
            <Field data-invalid={!!errors.street}>
              <FieldLabel htmlFor="address-street">Street</FieldLabel>
              <Input
                id="address-street"
                aria-invalid={!!errors.street}
                {...register('street', { required: 'Street is required' })}
              />
              {/* PATTERN: Field-level validation — error indicators stay inside the component */}
              <FieldError errors={[errors.street]} />
            </Field>
            <Field data-invalid={!!errors.city}>
              <FieldLabel htmlFor="address-city">City</FieldLabel>
              <Input
                id="address-city"
                aria-invalid={!!errors.city}
                {...register('city', { required: 'City is required' })}
              />
              <FieldError errors={[errors.city]} />
            </Field>
          </FormRow>
          <FormRow>
            <Field data-invalid={!!errors.state}>
              <FieldLabel htmlFor="address-state">State</FieldLabel>
              <Input
                id="address-state"
                aria-invalid={!!errors.state}
                {...register('state', { required: 'State is required' })}
              />
              <FieldError errors={[errors.state]} />
            </Field>
            <Field data-invalid={!!errors.postcode}>
              <FieldLabel htmlFor="address-postcode">Postcode</FieldLabel>
              <Input
                id="address-postcode"
                aria-invalid={!!errors.postcode}
                {...register('postcode', { required: 'Postcode is required' })}
              />
              <FieldError errors={[errors.postcode]} />
            </Field>
            <Field data-invalid={!!errors.country}>
              <FieldLabel htmlFor="address-country">Country</FieldLabel>
              <Input
                id="address-country"
                aria-invalid={!!errors.country}
                {...register('country', { required: 'Country is required' })}
              />
              <FieldError errors={[errors.country]} />
            </Field>
          </FormRow>
        </>
      ) : (
        // Read-only mode — display fields
        <DetailGrid>
          <DetailField label="Street">{initialAddress?.street ?? '—'}</DetailField>
          <DetailField label="City">{initialAddress?.city ?? '—'}</DetailField>
          <DetailField label="State">{initialAddress?.state ?? '—'}</DetailField>
          <DetailField label="Postcode">{initialAddress?.postcode ?? '—'}</DetailField>
          <DetailField label="Country">{initialAddress?.country ?? '—'}</DetailField>
        </DetailGrid>
      )}
    </SectionCard>
  )
}
