// =============================================================================
// WHAT: Stub transport for apiFetch()
// ROLE: The stub side of the backend. Maps an HTTP-style request
//       (path + method + body) to the matching stub function in stubsApi.ts.
//
// WHY THIS EXISTS:
//   The data hooks call apiFetch('/orders/123') exactly as they will in
//   production. apiFetch() decides — via a single USE_STUBS flag — whether
//   to make a real HTTP request or to route here to the stubs.
//
//   This means:
//     • Hooks, pages and components NEVER reference stubs. They only ever
//       call apiFetch() with a REST path. Their code is production-identical.
//     • The ONLY switch between stubs and the real backend is the USE_STUBS
//       flag inside apiFetch.ts. Flip that one flag and the entire app talks
//       to the real backend. No other file changes.
//     • This dispatcher and stubsApi.ts are the ONLY places that know stubs
//       exist. They can remain in the codebase permanently, dormant when the
//       flag is off.
//
// HOW TO READ THIS FILE:
//   Each branch matches one REST endpoint (method + path pattern) and calls
//   the corresponding stub. This is deliberately simple and explicit —
//   "slightly clumsy but completely obvious"
//   (cc27 / Architectural Heuristics / Slightly Clumsy but Completely Obvious).
// =============================================================================

import type { ApiRequestOptions } from '@/app/apiFetch'
import type { OrderFilters } from '@/pages/order-search/orderSearchTypes'
import {
  stubGetOrders,
  stubGetOrder,
  stubGetOrderLineItems,
  stubSaveOrder,
  stubApproveOrder,
  stubCancelOrder,
  stubDispatchOrder,
  stubCreateOrder,
  stubGetCustomers,
  stubGetCustomerAddresses,
  stubGetCarriers,
  stubGetServiceLevels,
  stubGetProducts,
  stubGetWarehouse,
  stubAddAllocation,
  stubRemoveAllocation,
  stubLogin,
} from './stubsApi'

// Route an apiFetch() call to the matching stub function.
// Returns the stub's result, typed as T to match the apiFetch<T> contract.
export async function apiFetchStubs<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const body = options.body

  // Split the path from its query string (e.g. '/orders?status=pending')
  const [pathname, queryString = ''] = path.split('?')
  const query = new URLSearchParams(queryString)

  // --- Auth ---------------------------------------------------------------
  if (method === 'POST' && pathname === '/auth/login') {
    const { email, password } = body as { email: string; password: string }
    return (await stubLogin(email, password)) as T
  }

  // --- Reference data -----------------------------------------------------
  if (method === 'GET' && pathname === '/customers') {
    return (await stubGetCustomers()) as T
  }
  if (method === 'GET' && /^\/customers\/[^/]+\/addresses$/.test(pathname)) {
    const customerId = pathname.split('/')[2]
    return (await stubGetCustomerAddresses(customerId)) as T
  }
  if (method === 'GET' && pathname === '/carriers') {
    return (await stubGetCarriers()) as T
  }
  if (method === 'GET' && pathname === '/products') {
    return (await stubGetProducts()) as T
  }
  if (method === 'GET' && pathname === '/reference-data/service-levels') {
    return (await stubGetServiceLevels()) as T
  }

  // --- Orders -------------------------------------------------------------
  if (method === 'GET' && pathname === '/orders') {
    // Reconstruct the OrderFilters object from the query string.
    const filters: OrderFilters = {
      customerName: query.get('customerName') ?? '',
      status: query.get('status') ?? '',
      dateFrom: query.get('dateFrom') ?? '',
      dateTo: query.get('dateTo') ?? '',
    }
    return (await stubGetOrders(filters)) as T
  }
  if (method === 'POST' && pathname === '/orders') {
    return (await stubCreateOrder(body as Parameters<typeof stubCreateOrder>[0])) as T
  }
  if (method === 'GET' && /^\/orders\/[^/]+$/.test(pathname)) {
    const orderId = pathname.split('/')[2]
    return (await stubGetOrder(orderId)) as T
  }
  // Line items have their own endpoint, fetched independently by the Line Items tab.
  if (method === 'GET' && /^\/orders\/[^/]+\/line-items$/.test(pathname)) {
    const orderId = pathname.split('/')[2]
    return (await stubGetOrderLineItems(orderId)) as T
  }
  if (method === 'PUT' && /^\/orders\/[^/]+$/.test(pathname)) {
    const orderId = pathname.split('/')[2]
    return (await stubSaveOrder(orderId, body as Parameters<typeof stubSaveOrder>[1])) as T
  }
  if (method === 'POST' && /^\/orders\/[^/]+\/approve$/.test(pathname)) {
    const orderId = pathname.split('/')[2]
    return (await stubApproveOrder(orderId)) as T
  }
  if (method === 'POST' && /^\/orders\/[^/]+\/cancel$/.test(pathname)) {
    const orderId = pathname.split('/')[2]
    return (await stubCancelOrder(orderId)) as T
  }
  if (method === 'POST' && /^\/orders\/[^/]+\/dispatch$/.test(pathname)) {
    const orderId = pathname.split('/')[2]
    return (await stubDispatchOrder(orderId)) as T
  }

  // --- Warehouses ---------------------------------------------------------
  if (method === 'GET' && /^\/warehouses\/[^/]+$/.test(pathname)) {
    const warehouseId = pathname.split('/')[2]
    return (await stubGetWarehouse(warehouseId)) as T
  }
  if (method === 'POST' && /^\/warehouses\/[^/]+\/allocations$/.test(pathname)) {
    const warehouseId = pathname.split('/')[2]
    return (await stubAddAllocation(warehouseId, body as Parameters<typeof stubAddAllocation>[1])) as T
  }
  if (method === 'DELETE' && /^\/warehouses\/[^/]+\/allocations\/[^/]+$/.test(pathname)) {
    const parts = pathname.split('/')
    const warehouseId = parts[2]
    const allocationId = parts[4]
    return (await stubRemoveAllocation(warehouseId, allocationId)) as T
  }

  // No stub matched — this signals a missing stub mapping during development.
  throw new Error(`apiFetchStubs: no stub mapped for ${method} ${pathname}`)
}
