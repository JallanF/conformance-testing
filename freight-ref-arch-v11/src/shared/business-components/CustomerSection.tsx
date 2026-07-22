// =============================================================================
// WHAT: CustomerSection — Business Component
// ROLE: Displays and edits the customer on an order. Follows the full pull
//       pattern: exposes getData/reset/isDirty to the Page via ref.
//
// PULL PATTERN DEMONSTRATION (cc27 / Screen Composition / Business Component Ref Contract):
//   This is the clearest example of the pull pattern in the application.
//   Read this file alongside useEditOrderPage.ts to understand the full flow:
//
//     1. Page JSX:         <CustomerSection ref={customerSectionRef} ... />
//     2. Page hook:        const result = await customerSectionRef.current?.getData()
//     3. This component:   getData() validates the form, returns { isValid, data }
//     4. Page hook:        Uses result.data to build the save payload
//
//   The Page never reaches into this component's form state directly.
//   This component never knows when a save is happening.
//   Communication flows entirely via the ref contract.
//
// REACT 19 — REF AS PLAIN PROP:
//   In React 19, refs are passed as plain props — no forwardRef() needed.
//   The `ref` prop appears in the component's props type (CustomerSectionProps).
//   useImperativeHandle() still works the same way.
//
// COMBOBOX IN AN RHF FORM — Controller + ui/combobox (cc27 / Selects and
// Controlled Inputs): the customer selector is a SEARCHABLE select — a real
// customer list is hundreds of rows, so the user types to filter (D10.2).
// Like every non-native control, it connects through RHF's Controller.
// Base UI Combobox specifics: items are { value, label } objects (label is
// displayed and filtered automatically); the controlled `value` is the
// selected ITEM (or null), so the Controller maps item ⇄ customerId string —
// RHF stores only the id, exactly as it did with the plain select.
//
// CROSS-COMPONENT EVENT:
//   When the user selects a different customer, this component raises an
//   onCustomerChange event to the Page orchestration hook. The hook then
//   triggers a new fetch for that customer's addresses (dependent data loading).
//   This component does not fetch addresses — the Page passes them via props.
//   RULE: field.onChange runs FIRST — RHF always hears the change — then the
//   side effect (cc27 / Selects and Controlled Inputs).
//
// SEE ALSO:
//   pages/edit-order/useEditOrderPage.ts  — calls getData() on the ref
//   shared/business-components/AddressSection.tsx — receives addresses from the
//                                                same dependent data loading
// =============================================================================

import { useImperativeHandle, type Ref } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { DetailField } from '@/shared/technical-components/DetailField'
import { DetailGrid } from '@/shared/technical-components/DetailGrid'
import { FormRow } from '@/shared/technical-components/FormRow'
import { SectionCard } from '@/shared/technical-components/SectionCard'
import type { Customer } from '@/shared/contracts/selectorContracts'
import type { SectionDataResult } from '@/shared/types/sectionDataResult'

// PATTERN: Component ref contract
// Exported so the orchestration hook can type its ref.
// getData() returns SectionDataResult — a discriminated union, so callers
// that check isValid get data without any "!" assertions.
export interface CustomerSectionHandle {
  getData(): Promise<SectionDataResult<CustomerFormData>>
  reset(): void
  isDirty(): boolean
}

// CustomerFormData is this section's FORM OUTPUT — the shape getData() returns.
// It carries ONLY the customerId reference: the customer's NAME is server-owned
// (the order write sends the id; the server derives the name and returns it on
// read — see cc26 / Business Logic Ownership). It is a client-only form type,
// NOT the selector `Customer` DTO in selectorContracts.ts.
export interface CustomerFormData {
  customerId: string
}

interface CustomerSectionProps {
  ref?: Ref<CustomerSectionHandle>
  initialCustomerId?: string
  initialCustomerName?: string
  customers?: Customer[]
  canEdit?: boolean
  // PATTERN: Cross-component event
  // Raised when the user selects a different customer.
  // The Page orchestration hook responds by fetching the new customer's addresses.
  onCustomerChange?: (customerId: string) => void
}

// BUSINESS COMPONENT — owns editing state. Exposes pull pattern interface via ref.
export function CustomerSection({
  ref,
  initialCustomerId = '',
  initialCustomerName = '',
  customers = [],
  canEdit = false,
  onCustomerChange,
}: CustomerSectionProps) {
  const {
    control,
    trigger,
    reset: resetForm,
    getValues,
    formState: { isDirty: formIsDirty },
  } = useForm<CustomerFormData>({
    defaultValues: {
      customerId: initialCustomerId,
    },
  })

  // PATTERN: Pull pattern via useImperativeHandle (React 19)
  useImperativeHandle(ref, () => ({
    async getData(): Promise<SectionDataResult<CustomerFormData>> {
      const isValid = await trigger()
      if (!isValid) return { isValid: false, data: null }
      return { isValid: true, data: getValues() }
    },
    reset() {
      resetForm({ customerId: initialCustomerId })
    },
    isDirty() {
      return formIsDirty
    },
  }))

  return (
    <SectionCard title="Customer">
      {canEdit ? (
        <FormRow>
          <Controller
            name="customerId"
            control={control}
            rules={{ required: 'Please select a customer' }}
            render={({ field, fieldState }) => {
              // Combobox items: { value, label } — label displays/filters
              // automatically. The controlled value is the selected ITEM;
              // RHF stores the id string, so map between the two here.
              const customerItems = customers.map(customer => ({
                value: customer.customerId,
                label: customer.name,
              }))
              const selectedItem =
                customerItems.find(item => item.value === field.value) ?? null

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customer-combobox">Customer</FieldLabel>
                  <Combobox
                    items={customerItems}
                    value={selectedItem}
                    onValueChange={(item) => {
                      field.onChange(item?.value ?? '')            // RHF first — always
                      if (item) onCustomerChange?.(item.value)     // then the side effect
                    }}
                  >
                    <ComboboxInput
                      id="customer-combobox"
                      placeholder="Search customers…"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No customers found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: { value: string; label: string }) => (
                          <ComboboxItem key={item.value} value={item}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )
            }}
          />
        </FormRow>
      ) : (
        <DetailGrid>
          <DetailField label="Customer">{initialCustomerName || '—'}</DetailField>
        </DetailGrid>
      )}
    </SectionCard>
  )
}
