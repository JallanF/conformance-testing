// =============================================================================
// WHAT: Not Found page orchestration hook
// ROLE: Contains all logic for the Not Found page — deliberately tiny.
//
// ARCHITECTURE NOTE (cc27 / Screen Composition / The Page Orchestration Hook):
//   Every page has a use[PageName]Page() hook, even trivial pages like this
//   one. Consistency is more important than avoiding a thin hook: a developer
//   opening ANY page folder finds the same two files playing the same roles.
// =============================================================================

import { useNavigate } from 'react-router'

export function useNotFoundPage() {
  const navigate = useNavigate()

  // Client-side navigation back to the default feature. (Contrast with
  // PageErrorFallback, which uses a full-reload <a> because it renders after
  // a crash; here nothing is broken, so an SPA navigation is correct.)
  const handleGoToOrders = () => navigate('/orders')

  return {
    // handlers
    handleGoToOrders,
  }
}
