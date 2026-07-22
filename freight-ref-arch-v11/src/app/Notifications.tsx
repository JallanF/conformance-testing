// =============================================================================
// WHAT: Application notification gateway (toasts)
// ROLE: The ONLY file in the codebase that imports the toast library (sonner).
//       Orchestration hooks call showSuccessToast() / showErrorToast(); App.tsx
//       mounts <NotificationsPortal/>. Nothing else knows which toast library
//       is in use.
//
// ARCHITECTURE NOTE (cc27 / State Management / Toasts and Page Messages):
//   Same single-gateway discipline as apiFetch(): one layer knows the vendor.
//     fetch()        → known only by app/apiFetch.ts
//     TanStack Query → known only by the data hooks
//     React Hook Form→ known only by Business Components
//     sonner         → known only by this file
//   Swapping the toast library is a change to THIS FILE ALONE — no ripple
//   through the orchestration hooks that fire notifications.
//
//   WHEN TO USE WHICH (cc27 / Toasts and Page Messages):
//     Action outcome (success or failure of a save / workflow action)
//       → showSuccessToast / showErrorToast. Toasts survive navigation —
//         the portal renders outside the Router.
//     In-page state the user must act on (e.g. validation summary)
//       → PageMessage banner, owned by the page orchestration hook.
//     Single-field problems → field errors inside Business Components.
//
// SEE ALSO:
//   app/App.tsx — mounts <NotificationsPortal/>
//   shared/technical-components/PageMessageBanner.tsx — the in-page banner
// =============================================================================

import { Toaster, toast } from 'sonner'

// Fired by orchestration hooks when an action completes successfully.
export function showSuccessToast(text: string): void {
  toast.success(text)
}

// Fired by orchestration hooks when an action fails.
export function showErrorToast(text: string): void {
  toast.error(text)
}

// The app-wide toast portal. Mounted once, in App.tsx, OUTSIDE the Router —
// which is why a toast fired just before a navigation survives the page
// change. richColors gives success/error toasts their green/red colouring.
export function NotificationsPortal() {
  return <Toaster position="top-right" richColors />
}
