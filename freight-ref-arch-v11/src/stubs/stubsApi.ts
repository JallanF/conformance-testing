// =============================================================================
// WHAT: Centralised stub backend API
// ROLE: Replaces all real HTTP calls during development and demonstration.
//       Every function in this file corresponds 1:1 with a real API endpoint
//       that would exist in production.
//
// ARCHITECTURE NOTE:
//   This file is the ONLY place stubs live. The hook layer (useOrdersQuery,
//   useOrderQuery, etc.) call functions from this file via apiFetch(). When the
//   real backend is ready, apiFetch() is pointed at the real server and this
//   file becomes irrelevant. No other files need to change.
//
// DATA NOTE:
//   Stub data is coherent across pages — the order found in search is the
//   same order seen in detail view, same customer shown in the order appears
//   in the customer selector, etc. This makes the running application feel
//   like a real system.
//
// USAGE:
//   This file is NOT imported directly by hooks. Hooks call apiFetch(), which
//   routes to these stubs via the VITE_USE_STUBS environment variable (always
//   true in this reference architecture). See app/apiFetch.ts.
//
// READING ORDER:
//   1. Types (imported from shared/contracts and page-owned type files)
//   2. Static stub data
//   3. Stub API functions (grouped by domain)
// =============================================================================

import type { OrderSummary, Order, OrderLineItem } from '@/shared/contracts/orderContracts'
import type { ServiceLevel } from '@/shared/reference-data/referenceDataTypes'
import type { OrderFilters } from '@/pages/order-search/orderSearchTypes'
import type { SaveOrderPayload } from '@/pages/edit-order/editOrderTypes'
import type { CreateOrderPayload } from '@/pages/create-order/createOrderTypes'
import type { Warehouse, AllocationPriority } from '@/pages/warehouse-details/warehouseDetailsTypes'
import type { AuthUser } from '@/shared/contracts/authContracts'
import { UserRole } from '@/shared/types/userRole'

// Artificial delay (ms) to simulate network latency.
// Makes loading states visible during development and demonstration.
const STUB_DELAY = 600

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// =============================================================================
// STUB DATA
// =============================================================================

// --- Users ---------------------------------------------------------------

const STUB_USERS: (AuthUser & { password: string })[] = [
  {
    userId: 'U001',
    name: 'Sarah Chen',
    email: 'manager@freightos.com',
    role: UserRole.Manager,
    password: 'password',
  },
  {
    userId: 'U002',
    name: 'James Wilson',
    email: 'operator@freightos.com',
    role: UserRole.Operator,
    password: 'password',
  },
  {
    userId: 'U003',
    name: 'Alex Thompson',
    email: 'admin@freightos.com',
    role: UserRole.Admin,
    password: 'password',
  },
]

// --- Customers -----------------------------------------------------------

const STUB_CUSTOMERS = [
  { customerId: 'C001', name: 'Acme Logistics Ltd' },
  { customerId: 'C002', name: 'Blue Ocean Shipping Co' },
  { customerId: 'C003', name: 'Pacific Rim Trading' },
  { customerId: 'C004', name: 'Northern Freight Solutions' },
]

// --- Customer Addresses --------------------------------------------------

const STUB_ADDRESSES: Record<string, Array<{ addressId: string; label: string; street: string; city: string; state: string; postcode: string; country: string }>> = {
  C001: [
    { addressId: 'A001', label: 'Head Office', street: '123 Industrial Blvd', city: 'Melbourne', state: 'VIC', postcode: '3000', country: 'Australia' },
    { addressId: 'A002', label: 'Warehouse', street: '456 Warehouse St', city: 'Dandenong', state: 'VIC', postcode: '3175', country: 'Australia' },
  ],
  C002: [
    { addressId: 'A003', label: 'Port Office', street: '789 Harbour Dr', city: 'Sydney', state: 'NSW', postcode: '2000', country: 'Australia' },
    { addressId: 'A004', label: 'Distribution', street: '321 Port Access Rd', city: 'Botany', state: 'NSW', postcode: '2019', country: 'Australia' },
  ],
  C003: [
    { addressId: 'A005', label: 'Trade Centre', street: '55 Trade Centre Dr', city: 'Brisbane', state: 'QLD', postcode: '4000', country: 'Australia' },
  ],
  C004: [
    { addressId: 'A006', label: 'Main Depot', street: '88 Transport Way', city: 'Darwin', state: 'NT', postcode: '0800', country: 'Australia' },
  ],
}

// --- Products ------------------------------------------------------------

const STUB_PRODUCTS = [
  { productId: 'P001', name: 'Industrial Bearings (Box)', unitPrice: 85.00 },
  { productId: 'P002', name: 'Electronic Components (Pallet)', unitPrice: 420.00 },
  { productId: 'P003', name: 'Chemical Compounds (Drum)', unitPrice: 310.00 },
  { productId: 'P004', name: 'Automotive Parts (Crate)', unitPrice: 650.00 },
  { productId: 'P005', name: 'Food Grade Packaging (Roll)', unitPrice: 45.00 },
]

// --- Carriers ------------------------------------------------------------

const STUB_CARRIERS = [
  { carrierId: 'CAR001', name: 'FastFreight Express' },
  { carrierId: 'CAR002', name: 'Pacific Cargo Lines' },
  { carrierId: 'CAR003', name: 'Northern Logistics' },
]

// Reference data — domain-neutral lookup values with the standardised
// ReferenceItem shape ({ id, value, description? }).
const STUB_SERVICE_LEVELS: ServiceLevel[] = [
  { id: 'standard',  value: 'Standard',  description: '5 business days' },
  { id: 'express',   value: 'Express',   description: '2 business days' },
  { id: 'overnight', value: 'Overnight', description: 'Next business day' },
]

// --- Orders --------------------------------------------------------------
// Coherent data: same orders appear in search results and detail view.
// Financial data is stored on every order — the SERVER (this stub, via
// applyOrderVisibility) suppresses it per the caller's role BEFORE returning,
// exactly as a real backend would. The FE then renders purely on presence.

const STUB_ORDERS: Order[] = [
  {
    orderId: 'ORD-2024-001',
    customerId: 'C001',
    customerName: 'Acme Logistics Ltd',
    orderDate: '2024-01-15',
    status: 'approved',
    warehouseLocation: 'Melbourne',
    orderedBy: 'Sarah Chen',
    requiresApproval: false,
    availableActions: ['edit', 'cancel', 'dispatch'],
    deliveryAddress: {
      addressId: 'A001',
      label: 'Head Office',
      street: '123 Industrial Blvd',
      city: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      country: 'Australia',
    },
    lineItems: [
      { lineItemId: 'LI001', productId: 'P001', productName: 'Industrial Bearings (Box)', quantity: 5, unitPrice: 85.00 },
      { lineItemId: 'LI002', productId: 'P002', productName: 'Electronic Components (Pallet)', quantity: 2, unitPrice: 420.00 },
    ],
    financials: { subtotal: 1265.00, tax: 126.50, total: 1391.50, marginPercent: 22 },
  },
  {
    orderId: 'ORD-2024-002',
    customerId: 'C002',
    customerName: 'Blue Ocean Shipping Co',
    orderDate: '2024-01-22',
    status: 'pending',
    warehouseLocation: 'Sydney',
    orderedBy: 'James Wilson',
    requiresApproval: true,
    availableActions: ['edit', 'approve', 'cancel'],
    deliveryAddress: {
      addressId: 'A003',
      label: 'Port Office',
      street: '789 Harbour Dr',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia',
    },
    lineItems: [
      { lineItemId: 'LI003', productId: 'P004', productName: 'Automotive Parts (Crate)', quantity: 10, unitPrice: 650.00 },
    ],
    financials: { subtotal: 6500.00, tax: 650.00, total: 7150.00, marginPercent: 18 },
  },
  {
    orderId: 'ORD-2024-003',
    customerId: 'C003',
    customerName: 'Pacific Rim Trading',
    orderDate: '2024-01-28',
    status: 'dispatched',
    warehouseLocation: 'Brisbane',
    orderedBy: 'Sarah Chen',
    requiresApproval: false,
    availableActions: [],
    deliveryAddress: {
      addressId: 'A005',
      label: 'Trade Centre',
      street: '55 Trade Centre Dr',
      city: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      country: 'Australia',
    },
    lineItems: [
      { lineItemId: 'LI004', productId: 'P003', productName: 'Chemical Compounds (Drum)', quantity: 3, unitPrice: 310.00 },
    ],
    financials: { subtotal: 930.00, tax: 93.00, total: 1023.00, marginPercent: 31 },
  },
  {
    orderId: 'ORD-2024-004',
    customerId: 'C004',
    customerName: 'Northern Freight Solutions',
    orderDate: '2024-02-03',
    status: 'pending',
    warehouseLocation: 'Melbourne',
    orderedBy: 'James Wilson',
    requiresApproval: true,
    availableActions: ['edit', 'approve', 'cancel'],
    deliveryAddress: {
      addressId: 'A006',
      label: 'Main Depot',
      street: '88 Transport Way',
      city: 'Darwin',
      state: 'NT',
      postcode: '0800',
      country: 'Australia',
    },
    lineItems: [
      { lineItemId: 'LI005', productId: 'P005', productName: 'Food Grade Packaging (Roll)', quantity: 20, unitPrice: 45.00 },
    ],
    financials: { subtotal: 900.00, tax: 90.00, total: 990.00, marginPercent: 15 },
  },
  {
    orderId: 'ORD-2024-005',
    customerId: 'C001',
    customerName: 'Acme Logistics Ltd',
    orderDate: '2024-02-10',
    status: 'cancelled',
    warehouseLocation: 'Perth',
    orderedBy: 'Alex Thompson',
    requiresApproval: false,
    availableActions: [],
    deliveryAddress: {
      addressId: 'A001',
      label: 'Head Office',
      street: '123 Industrial Blvd',
      city: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      country: 'Australia',
    },
    lineItems: [
      { lineItemId: 'LI006', productId: 'P002', productName: 'Electronic Components (Pallet)', quantity: 1, unitPrice: 420.00 },
    ],
    financials: { subtotal: 420.00, tax: 42.00, total: 462.00, marginPercent: 20 },
  },
]

// --- Warehouse -----------------------------------------------------------

const STUB_WAREHOUSE: Warehouse = {
  warehouseId: 'WH-001',
  name: 'Melbourne Distribution Centre',
  type: 'Distribution',
  status: 'active',
  hasPremiumStorage: true,
  address: {
    addressId: 'WA001',
    label: 'Main Gate',
    street: '100 Logistics Park',
    city: 'Laverton',
    state: 'VIC',
    postcode: '3028',
    country: 'Australia',
  },
  availableActions: ['schedule-maintenance', 'add-allocation'],
  allocations: [
    {
      allocationId: 'AL001',
      category: 'Industrial Bearings',
      quantity: 500,
      priority: 'high' as AllocationPriority,
      storageZone: 'Zone A',
      costPerUnit: 2.50,
      totalValue: 1250.00,
    },
    {
      allocationId: 'AL002',
      category: 'Electronic Components',
      quantity: 200,
      priority: 'critical' as AllocationPriority,
      storageZone: 'Premium Zone',
      costPerUnit: 15.00,
      totalValue: 3000.00,
    },
    {
      allocationId: 'AL003',
      category: 'Food Grade Packaging',
      quantity: 1000,
      priority: 'normal' as AllocationPriority,
      storageZone: 'Zone C',
      costPerUnit: 0.80,
      totalValue: 800.00,
    },
  ],
}

// =============================================================================
// STUB API FUNCTIONS
// Grouped by domain. Each function mirrors a real backend endpoint.
// =============================================================================

// --- Auth -----------------------------------------------------------------

// The currently signed-in stub user — a real backend reads this from the
// session. The stub remembers the NAME (for "ordered by" on created records)
// and the ROLE (to suppress data the caller may not see, exactly as a real
// backend would — see applyOrderVisibility / stubGetWarehouse).
let currentStubUserName = 'Unknown User'
let currentStubUserRole: UserRole = UserRole.Operator

export async function stubLogin(email: string, password: string): Promise<AuthUser> {
  await delay(STUB_DELAY)
  const user = STUB_USERS.find(user => user.email === email && user.password === password)
  if (!user) throw new Error('Invalid email or password.')
  currentStubUserName = user.name
  currentStubUserRole = user.role
  const { password: _, ...authUser } = user
  return authUser
}

// --- Customers ------------------------------------------------------------

export async function stubGetCustomers() {
  await delay(STUB_DELAY)
  return STUB_CUSTOMERS
}

export async function stubGetCustomerAddresses(customerId: string) {
  await delay(STUB_DELAY)
  const addresses = STUB_ADDRESSES[customerId]
  if (!addresses) throw new Error(`No addresses found for customer ${customerId}`)
  return addresses
}

// --- Products -------------------------------------------------------------

export async function stubGetProducts() {
  await delay(STUB_DELAY)
  return STUB_PRODUCTS
}

// --- Carriers -------------------------------------------------------------

export async function stubGetCarriers() {
  await delay(STUB_DELAY)
  return STUB_CARRIERS
}

// --- Reference data -------------------------------------------------------

export async function stubGetServiceLevels(): Promise<ServiceLevel[]> {
  await delay(STUB_DELAY)
  return STUB_SERVICE_LEVELS
}

// --- Orders ---------------------------------------------------------------

export async function stubGetOrders(filters: OrderFilters): Promise<OrderSummary[]> {
  await delay(STUB_DELAY)

  return STUB_ORDERS
    .filter(order => {
      if (filters.customerName && !order.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) return false
      if (filters.status && order.status !== filters.status) return false
      if (filters.dateFrom && order.orderDate < filters.dateFrom) return false
      if (filters.dateTo && order.orderDate > filters.dateTo) return false
      return true
    })
    .map(({ orderId, customerName, orderDate, status, warehouseLocation, orderedBy }) => ({
      orderId, customerName, orderDate, status, warehouseLocation, orderedBy,
    }))
}

// The server suppresses financial data by the caller's role BEFORE returning
// the order — operators get no financials at all; admins get financials without
// the margin. The FE then renders purely on PRESENCE (cc26 / Security and
// Permissions). Returns a shallow copy so the stored order is never mutated.
function applyOrderVisibility(order: Order): Order {
  if (currentStubUserRole === UserRole.Operator) {
    const visible = { ...order }
    delete visible.financials
    return visible
  }
  if (currentStubUserRole === UserRole.Admin && order.financials) {
    const financials = { ...order.financials }
    delete financials.marginPercent
    return { ...order, financials }
  }
  return order
}

export async function stubGetOrder(orderId: string): Promise<Order> {
  await delay(STUB_DELAY)
  const order = STUB_ORDERS.find(order => order.orderId === orderId)
  if (!order) throw new Error(`Order ${orderId} not found.`)
  return applyOrderVisibility(order)
}

// Line items are served from their OWN endpoint (/orders/:id/line-items),
// separate from the order fetch. This lets the Line Items tab fetch its data
// independently of the order query used by the layout and the Info tab —
// demonstrating that tabs are self-contained, not coupled to one shared query.
export async function stubGetOrderLineItems(orderId: string): Promise<OrderLineItem[]> {
  await delay(STUB_DELAY)
  const order = STUB_ORDERS.find(order => order.orderId === orderId)
  if (!order) throw new Error(`Order ${orderId} not found.`)
  return order.lineItems
}

// The server DERIVES the customer name from the id the client sent.
function deriveCustomerName(customerId: string): string {
  return STUB_CUSTOMERS.find(customer => customer.customerId === customerId)?.name ?? 'Unknown customer'
}

// The server builds each stored line from the { productId, quantity } the
// client sent — deriving the product name and PRICING the line from its own
// catalogue (it never trusts a client-supplied price). A real backend does
// exactly this. See cc26 / Business Logic Ownership.
function buildStoredLineItems(
  requestedItems: Array<{ productId: string; quantity: number }>,
): OrderLineItem[] {
  return requestedItems.map((requested, index) => {
    const product = STUB_PRODUCTS.find(product => product.productId === requested.productId)
    return {
      lineItemId: `LI${Date.now()}${index}`,   // server-assigned identity
      productId: requested.productId,
      productName: product?.name ?? 'Unknown product',
      quantity: requested.quantity,
      unitPrice: product?.unitPrice ?? 0,       // server-owned price
    }
  })
}

// Computes order financials from priced line items (10% GST).
function computeFinancials(lineItems: OrderLineItem[], marginPercent: number) {
  const subtotal = lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  const tax = subtotal * 0.10
  return { subtotal, tax, total: subtotal + tax, marginPercent }
}

export async function stubSaveOrder(orderId: string, payload: SaveOrderPayload): Promise<void> {
  await delay(STUB_DELAY)
  const order = STUB_ORDERS.find(order => order.orderId === orderId)
  if (!order) throw new Error(`Order ${orderId} not found.`)

  // The server APPLIES the write, deriving server-owned fields from the ids the
  // client sent (customer name, product names/prices) — the client sent only
  // references, quantities, and the edited address values.
  order.customerId = payload.customerId
  order.customerName = deriveCustomerName(payload.customerId)
  order.deliveryAddress = {
    ...order.deliveryAddress,      // keep the server-assigned addressId/label
    ...payload.deliveryAddress,    // apply the edited field values
  }
  order.lineItems = buildStoredLineItems(payload.lineItems)
  order.financials = computeFinancials(order.lineItems, order.financials?.marginPercent ?? 20)

  console.log('[stub] saveOrder', orderId, payload)
}

export async function stubApproveOrder(orderId: string): Promise<void> {
  await delay(STUB_DELAY)
  const order = STUB_ORDERS.find(order => order.orderId === orderId)
  if (!order) throw new Error(`Order ${orderId} not found.`)
  // Simulate — update local stub state
  order.status = 'approved'
  order.availableActions = ['edit', 'cancel', 'dispatch']
  console.log('[stub] approveOrder', orderId)
}

export async function stubCancelOrder(orderId: string): Promise<void> {
  await delay(STUB_DELAY)
  const order = STUB_ORDERS.find(order => order.orderId === orderId)
  if (!order) throw new Error(`Order ${orderId} not found.`)
  order.status = 'cancelled'
  order.availableActions = []
  console.log('[stub] cancelOrder', orderId)
}

export async function stubDispatchOrder(orderId: string): Promise<void> {
  await delay(STUB_DELAY)
  const order = STUB_ORDERS.find(order => order.orderId === orderId)
  if (!order) throw new Error(`Order ${orderId} not found.`)
  order.status = 'dispatched'
  order.availableActions = []
  console.log('[stub] dispatchOrder', orderId)
}

export async function stubCreateOrder(payload: CreateOrderPayload): Promise<{ orderId: string }> {
  await delay(STUB_DELAY)

  // Build and PERSIST the full order, exactly as a real backend would — the
  // client refetches after the create, and the new order must exist. All
  // server-owned values are derived here: ids, date, status, the customer
  // name, and the priced line items. The client sent only references,
  // quantities, and the edited address values.
  const newOrderId = `ORD-2024-${String(STUB_ORDERS.length + 1).padStart(3, '0')}`
  const storedLineItems = buildStoredLineItems(payload.lineItems)

  const newOrder: Order = {
    orderId: newOrderId,
    customerId: payload.customerId,
    customerName: deriveCustomerName(payload.customerId),
    orderDate: new Date().toISOString().slice(0, 10),
    status: 'pending',
    warehouseLocation: 'Melbourne',
    orderedBy: currentStubUserName,
    requiresApproval: true,
    availableActions: ['edit', 'approve', 'cancel'],
    deliveryAddress: {
      addressId: `A${Date.now()}`,          // server-assigned identity
      label: 'Delivery Address',
      ...payload.deliveryAddress,
    },
    lineItems: storedLineItems,
    // marginPercent is a demo value — a real backend computes it from costs.
    financials: computeFinancials(storedLineItems, 20),
  }
  STUB_ORDERS.push(newOrder)

  console.log('[stub] createOrder', newOrderId, payload)
  // Resource-creating POST returns only the new id
  // (cc27 / Backend Interaction / Write Responses and Refresh).
  return { orderId: newOrderId }
}

// --- Warehousing ----------------------------------------------------------

export async function stubGetWarehouse(warehouseId: string): Promise<Warehouse> {
  await delay(STUB_DELAY)
  if (warehouseId !== STUB_WAREHOUSE.warehouseId) {
    throw new Error(`Warehouse ${warehouseId} not found.`)
  }
  // The server suppresses cost data for users without financial visibility
  // (operators) BEFORE returning; the FE renders on presence (cc26 / Security
  // and Permissions). A shallow copy per allocation keeps the stored data intact.
  const allocations = STUB_WAREHOUSE.allocations.map(allocation => {
    const visible = { ...allocation }
    if (currentStubUserRole === UserRole.Operator) {
      delete visible.costPerUnit
      delete visible.totalValue
    }
    return visible
  })
  return { ...STUB_WAREHOUSE, allocations }
}

export async function stubAddAllocation(
  warehouseId: string,
  payload: { category: string; quantity: number; priority: AllocationPriority; storageZone: string }
): Promise<{ allocationId: string }> {
  await delay(STUB_DELAY)
  console.log('[stub] addAllocation', warehouseId, payload)
  const allocationId = `AL${Date.now()}`
  STUB_WAREHOUSE.allocations.push({
    allocationId,
    category: payload.category,
    quantity: payload.quantity,
    priority: payload.priority,
    storageZone: payload.storageZone,
    costPerUnit: 5.00,
    totalValue: payload.quantity * 5.00,
  })
  // Resource-creating POST returns the new id, like create-order
  // (cc27 / Backend Interaction / Write Responses and Refresh).
  return { allocationId }
}

export async function stubRemoveAllocation(warehouseId: string, allocationId: string): Promise<void> {
  await delay(STUB_DELAY)
  console.log('[stub] removeAllocation', warehouseId, allocationId)
  const index = STUB_WAREHOUSE.allocations.findIndex(allocation => allocation.allocationId === allocationId)
  if (index !== -1) STUB_WAREHOUSE.allocations.splice(index, 1)
}
