// =============================================================================
// WHAT: Application entry point
// ROLE: Mounts the React application into the DOM
// NOTE: All application-level providers (Auth, Query, Router) are configured
//       in App.tsx. This file simply bootstraps React.
// =============================================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
