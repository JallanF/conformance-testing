// =============================================================================
// WHAT: Page-local components for the Create Order page
// ROLE: All components used only by the Create Order page, bundled in the
//       page's single [PageName]Components.tsx file (cc27 / Frontend Structure).
//
// COMPONENTS IN THIS FILE:
//   CarrierStep — wizard step Business Component (carrier + service level)
//
// NOTE: The other wizard steps (CustomerSection, AddressSection,
//   OrderItemsSection) are SHARED Business Components — they live in
//   shared/business-components/ because more than one page uses them.
//   Only components used exclusively by this page live here.
// =============================================================================

import { useImperativeHandle, type Ref } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { FormRow } from '@/shared/technical-components/FormRow'
import { SectionCard } from '@/shared/technical-components/SectionCard'
import type { ServiceLevel } from '@/shared/reference-data/referenceDataTypes'
import type { SectionDataResult } from '@/shared/types/sectionDataResult'

// =============================================================================
// WHAT: CarrierStep — Business Component (Create Order Wizard, step 4)
// ROLE: Collects carrier selection and service level.
//       Follows the full pull pattern for the wizard.
//
// SELECTS: both are RHF-form selects → Controller + ui/select (cc27 /
//   Selects and Controlled Inputs) — controlled, so values render correctly
//   even when the option lists load async. The service level is GENUINE
//   reference data (a domain-neutral lookup — cc27 / DTO and Type Guidance);
//   the carrier is a domain-entity selector. Same wiring either way.
//
// CHECKBOX + SWITCH: delivery options are boolean form fields. ui/checkbox
//   and ui/switch are Base UI controls (checked / onCheckedChange), not
//   native inputs the browser tracks — so, like selects, they connect
//   through Controller (cc27 / Selects and Controlled Inputs). Both use the
//   Field horizontal orientation (control beside label).
// =============================================================================

export interface CarrierStepFormValues {
  carrierId: string
  serviceLevel: string
  saturdayDelivery: boolean
  notifyCustomer: boolean
}

export interface CarrierStepHandle {
  getData(): Promise<SectionDataResult<CarrierStepFormValues>>
  reset(): void
  isDirty(): boolean
}

interface CarrierStepProps {
  ref?: Ref<CarrierStepHandle>
  carriers: Array<{ carrierId: string; name: string }>
  serviceLevels: ServiceLevel[]
}

// Display label for a service level — used by both the items mapping (the
// closed trigger) and the option list, so the two can never drift apart.
function serviceLevelLabel(serviceLevel: ServiceLevel): string {
  return `${serviceLevel.value}${serviceLevel.description ? ` (${serviceLevel.description})` : ''}`
}

export function CarrierStep({ ref, carriers, serviceLevels }: CarrierStepProps) {
  const {
    control,
    trigger,
    reset: resetForm,
    getValues,
    formState: { isDirty: formIsDirty },
  } = useForm<CarrierStepFormValues>({
    defaultValues: { carrierId: '', serviceLevel: '', saturdayDelivery: false, notifyCustomer: true },
  })

  useImperativeHandle(ref, () => ({
    async getData(): Promise<SectionDataResult<CarrierStepFormValues>> {
      const isValid = await trigger()
      if (!isValid) return { isValid: false, data: null }
      return { isValid: true, data: getValues() }
    },
    reset() { resetForm({ carrierId: '', serviceLevel: '', saturdayDelivery: false, notifyCustomer: true }) },
    isDirty() { return formIsDirty },
  }))

  return (
    <SectionCard title="Carrier & Service Level">
      <FormRow>
        <Controller
          name="carrierId"
          control={control}
          rules={{ required: 'Please select a carrier' }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="carrier-select">Carrier</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                items={carriers.map(carrier => ({ value: carrier.carrierId, label: carrier.name }))}
                inputRef={field.ref}
              >
                <SelectTrigger
                  id="carrier-select"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="— select a carrier —" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map(carrier => (
                    <SelectItem key={carrier.carrierId} value={carrier.carrierId}>
                      {carrier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="serviceLevel"
          control={control}
          rules={{ required: 'Please select a service level' }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="service-level-select">Service Level</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                items={serviceLevels.map(serviceLevel => ({
                  value: serviceLevel.id,
                  label: serviceLevelLabel(serviceLevel),
                }))}
                inputRef={field.ref}
              >
                <SelectTrigger
                  id="service-level-select"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="— select a service level —" />
                </SelectTrigger>
                <SelectContent>
                  {serviceLevels.map(serviceLevel => (
                    <SelectItem key={serviceLevel.id} value={serviceLevel.id}>
                      {serviceLevelLabel(serviceLevel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FormRow>

      {/* Delivery options — boolean fields via Controller (see header). */}
      <div className="mt-2 flex flex-col gap-4">
        <Controller
          name="saturdayDelivery"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="saturday-delivery"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
              />
              <FieldLabel htmlFor="saturday-delivery" className="font-normal">
                Saturday delivery
              </FieldLabel>
            </Field>
          )}
        />
        <Controller
          name="notifyCustomer"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Switch
                id="notify-customer"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
              />
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor="notify-customer" className="font-normal">
                  Notify customer on dispatch
                </FieldLabel>
                <FieldDescription>
                  Sends the customer a notification when the order leaves the warehouse.
                </FieldDescription>
              </div>
            </Field>
          )}
        />
      </div>
    </SectionCard>
  )
}
