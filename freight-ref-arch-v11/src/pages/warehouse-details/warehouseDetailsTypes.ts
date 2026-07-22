// =============================================================================
// WHAT: Warehouse Details page types (page-owned)
// ROLE: Type definitions for the warehouse-details page, including the
//       warehouse read shape and the add-allocation write payload.
//
// ARCHITECTURE NOTE (cc27 / DTO and Type Guidance):
//   These are contracts (they mirror the backend), but PAGE-OWNED ones: only
//   the warehouse-details page uses them (the stub backend mirrors them, as
//   the real server would). Per the page-first rule they live with their page.
//   If a second page needs them, they graduate to shared/contracts/.
// =============================================================================

import type { Address } from '@/shared/contracts/addressContracts'

export type AllocationPriority = 'normal' | 'high' | 'critical'

export interface Allocation {
  allocationId: string
  category: string
  quantity: number
  priority: AllocationPriority
  storageZone: string
  // Optional — only returned for users with financial visibility
  costPerUnit?: number
  totalValue?: number
}

export interface Warehouse {
  warehouseId: string
  name: string
  type: string
  status: string
  hasPremiumStorage: boolean
  address: Address
  availableActions: string[]
  allocations: Allocation[]
}

// Payload for adding a new allocation
export interface AddAllocationPayload {
  category: string
  quantity: number
  priority: AllocationPriority
  storageZone: string
}
