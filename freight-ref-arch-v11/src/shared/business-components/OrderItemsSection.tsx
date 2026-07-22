// =============================================================================
// WHAT: OrderItemsSection — Business Component
// ROLE: Displays and edits the line items on an order. Demonstrates
//       React Hook Form's useFieldArray for dynamic list editing.
//
// USEFIELDARRAY PATTERN (cc27 / State Management / Component Editing State):
//   Line items are a dynamic list — the user can add and remove rows.
//   React Hook Form's useFieldArray manages this with full form integration:
//   each row is a registered field with its own validation, and the overall
//   array participates in the form's isDirty and validation state.
//
//   Alternative approaches (controlled array in useState) would require
//   manual dirty tracking and validation. useFieldArray integrates both
//   automatically.
//
// PULL PATTERN:
//   getData() returns the current line items array (validated).
//   reset() restores the initial line items from the order.
//   isDirty() returns true if any line item has changed or rows were added/removed.
//
// TABLE MARKUP: ui/table (the same vendor-zone components DataGrid renders
//   with) — but NOT DataGrid itself: this is a FORM table (inputs in cells,
//   rows owned by useFieldArray), not a data grid with sort/pagination.
//   Selects in rows connect through Controller (selects in RHF forms — cc27);
//   the quantity input is native, so it uses register (D14).
//
// SEE ALSO:
//   pages/edit-order/useEditOrderPage.ts  — pulls data via getData()
//   pages/create-order/useCreateOrderPage.ts — pulls data at wizard submit
// =============================================================================

import { useImperativeHandle, type Ref } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SectionCard } from '@/shared/technical-components/SectionCard'
import type { OrderLineItem } from '@/shared/contracts/orderContracts'
import type { Product } from '@/shared/contracts/selectorContracts'
import type { SectionDataResult } from '@/shared/types/sectionDataResult'

// PATTERN: Component ref contract
// getData() returns SectionDataResult — a discriminated union, so callers
// that check isValid get data without any "!" assertions.
export interface OrderItemsSectionHandle {
  getData(): Promise<SectionDataResult<{ lineItems: LineItemFormRow[] }>>
  reset(): void
  isDirty(): boolean
}

// The form holds ONLY what the user authors: which product, and how many.
// productName and unitPrice are server-owned (the write sends productId +
// quantity; the server derives the name and prices the line) — so they are
// NOT form fields. See cc26 / Business Logic Ownership.
export interface LineItemFormRow {
  productId: string
  quantity: number
}

interface OrderItemsSectionFormValues {
  lineItems: LineItemFormRow[]
}

interface OrderItemsSectionProps {
  ref?: Ref<OrderItemsSectionHandle>
  initialLineItems?: OrderLineItem[]
  products?: Product[]
  canEdit?: boolean
}

// BUSINESS COMPONENT — owns its line item form state via React Hook Form + useFieldArray.
export function OrderItemsSection({
  ref,
  initialLineItems = [],
  products = [],
  canEdit = false,
}: OrderItemsSectionProps) {
  const {
    register,
    control,
    trigger,
    reset: resetForm,
    getValues,
    watch,
    formState: { errors, isDirty: formIsDirty },
  } = useForm<OrderItemsSectionFormValues>({
    defaultValues: {
      lineItems: initialLineItems.map(lineItem => ({
        productId: lineItem.productId,
        quantity: lineItem.quantity,
      })),
    },
  })

  // PATTERN: useFieldArray for dynamic line items
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  })

  // PATTERN: Pull pattern
  useImperativeHandle(ref, () => ({
    async getData(): Promise<SectionDataResult<{ lineItems: LineItemFormRow[] }>> {
      const isValid = await trigger()
      if (!isValid) return { isValid: false, data: null }
      return { isValid: true, data: getValues() }
    },
    reset() {
      resetForm({
        lineItems: initialLineItems.map(lineItem => ({
          productId: lineItem.productId,
          quantity: lineItem.quantity,
        })),
      })
    },
    isDirty() {
      return formIsDirty
    },
  }))

  const handleAddLine = () => {
    append({ productId: '', quantity: 1 })
  }

  return (
    <SectionCard title="Line Items">
      <Table className="mb-3">
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/5">Product</TableHead>
            <TableHead className="w-[15%]">Quantity</TableHead>
            <TableHead className="w-1/5">Unit Price</TableHead>
            <TableHead className="w-1/5 text-right">Subtotal</TableHead>
            {canEdit && <TableHead className="w-[5%]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => {
            // The unit price is server-owned, never a form field. In EDIT mode
            // show the catalogue price for the selected product (the server
            // prices the order the same way); in READ-ONLY mode show the price
            // the server snapshotted onto the order. watch() makes the subtotal
            // recompute as the product/quantity change.
            const selectedProductId = watch(`lineItems.${index}.productId`)
            const catalogueProduct = products.find(product => product.productId === selectedProductId)

            const quantity = canEdit
              ? Number(watch(`lineItems.${index}.quantity`) || 0)
              : (initialLineItems[index]?.quantity ?? 0)
            const unitPrice = canEdit
              ? (catalogueProduct?.unitPrice ?? 0)
              : (initialLineItems[index]?.unitPrice ?? 0)
            const subtotal = quantity * unitPrice

            return (
              <TableRow key={field.id}>
                <TableCell>
                  {canEdit ? (
                    /* PATTERN: selects in RHF forms use Controller (cc27).
                       Controlled, so the value renders correctly even when the
                       products list loads AFTER this row mounts. */
                    <Controller
                      name={`lineItems.${index}.productId`}
                      control={control}
                      rules={{ required: 'Select a product' }}
                      render={({ field: selectField, fieldState }) => (
                        <Select
                          value={selectField.value}
                          onValueChange={(value) => selectField.onChange(value ?? '')}
                          items={products.map(product => ({ value: product.productId, label: product.name }))}
                          inputRef={selectField.ref}
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                            aria-label={`Product for line ${index + 1}`}
                            onBlur={selectField.onBlur}
                          >
                            <SelectValue placeholder="— select —" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.productId} value={product.productId}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    initialLineItems[index]?.productName ?? '—'
                  )}
                </TableCell>
                <TableCell>
                  {canEdit ? (
                    <Input
                      type="number"
                      min={1}
                      aria-invalid={!!errors.lineItems?.[index]?.quantity}
                      aria-label={`Quantity for line ${index + 1}`}
                      {...register(`lineItems.${index}.quantity`, {
                        required: true,
                        min: { value: 1, message: 'Min 1' },
                        valueAsNumber: true,
                      })}
                    />
                  ) : (
                    initialLineItems[index]?.quantity
                  )}
                </TableCell>
                {/* Unit price is DISPLAY-ONLY in both modes — the user picks the
                    product and quantity; the price is the server's (cc26).
                    tabular-nums: equal-width digits so the price/subtotal
                    columns align down the table. */}
                <TableCell className="tabular-nums">
                  {`$${unitPrice.toFixed(2)}`}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {`$${subtotal.toFixed(2)}`}
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      aria-label={`Remove line ${index + 1}`}
                    >
                      <X />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })}

          {fields.length === 0 && (
            <TableRow>
              <TableCell colSpan={canEdit ? 5 : 4} className="py-4 text-center text-muted-foreground">
                No line items. {canEdit && 'Add one below.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {canEdit && (
        <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
          + Add line item
        </Button>
      )}
    </SectionCard>
  )
}
