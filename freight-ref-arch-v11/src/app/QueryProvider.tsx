// =============================================================================
// WHAT: TanStack Query provider and configuration
// ROLE: Configures and provides the TanStack Query client to the application.
//       All server state (orders, warehouses, customers, etc.) flows through
//       this client.
//
// ARCHITECTURE NOTE (cc27 / Backend Interaction):
//   TanStack Query is an implementation detail of the hook layer.
//   Pages know hooks. Hooks know TanStack Query. Pages do NOT know TanStack
//   Query. This provider makes the client available to hooks via the library's
//   own useQueryClient() hook — pages are unaware of its existence.
//
//   Key configuration decisions:
//     staleTime: 30s   — data is considered fresh for 30 seconds after fetch.
//                        Prevents unnecessary refetches when navigating between
//                        pages quickly.
//     retry: 1         — retry failed requests once before reporting error.
//                        Balances resilience vs. time-to-error-message.
//     refetchOnWindowFocus: false — disabled to avoid unexpected refetches
//                        while users are working in other tabs. Appropriate for
//                        a business application where data changes are explicit.
//
//   EXPLICITLY PROHIBITED (cc27 / Save and Workflow Architecture / Optimistic Updates):
//     Optimistic updates are not used anywhere in this application.
//     The backend is the authoritative source of truth. The frontend always
//     waits for server confirmation before updating displayed state.
// =============================================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,         // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,                  // Never retry mutations — side effects are not idempotent
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
