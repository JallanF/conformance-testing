// =============================================================================
// WHAT: errorLog — the application's error-reporting gateway
// ROLE: The ONE place that knows how unexpected errors are reported. Everything
//       that needs to log an error calls logError(); nothing else talks to the
//       reporting mechanism directly.
//
// ONE VENDOR, ONE LAYER (cc27 / Architectural Heuristics):
//   Error reporting is a swappable cross-cutting concern, exactly like the
//   toast library (app/Notifications.tsx) or fetch (app/apiFetch.ts). Confining
//   it here means adopting a real reporter — Sentry, Datadog, a custom endpoint
//   — is a change to THIS FILE ALONE; no caller changes, because the signature
//   stays the same. This is a plain module, NOT a React context Provider:
//   logging is a fire-and-forget SERVICE call, not Application State that
//   components read (contrast AuthProvider / ThemeProvider).
//
// REFERENCE-STAGE (cc27 / Auth Boundary and Reference-stage Seams):
//   The console.error below is scaffolding a production build replaces. It is
//   marked REFERENCE-STAGE like the in-memory token and the stub import: swap
//   in the real reporter here, and the app is production-wired with no other
//   edits. Under test, mock this one module (e.g. vi.mock('@/app/errorLog')) —
//   the same single-seam swappability the USE_STUBS flag gives the transport.
//
// SEE ALSO:
//   shared/technical-components/PageErrorFallback.tsx — the first caller
//   app/Notifications.tsx — the sibling "one vendor, one layer" gateway (toasts)
// =============================================================================

// The context object lets callers tag WHERE an error came from and attach any
// extra detail a reporter should carry (route, entity id, …). Optional — a
// bare logError(error) is fine.
export interface ErrorContext {
  source?: string
  [key: string]: unknown
}

// logError() reports an unexpected error. Fire-and-forget: it never throws and
// never blocks the caller (a failure to log must not become a second failure).
export function logError(error: unknown, context: ErrorContext = {}): void {
  // REFERENCE-STAGE: replace this line with the real reporter, e.g.
  //   reporter.captureException(error, { extra: context })
  // Everything above and every call site stays exactly as-is.
  console.error(`[error]${context.source ? ` [${context.source}]` : ''}`, error, context)
}
