// =============================================================================
// WHAT: Page-level message banner
// ROLE: Renders a banner at the top of a page's content area for IN-PAGE state
//       the user must act on — e.g. the validation summary shown when a save
//       is blocked ("Please correct the highlighted errors and try again.").
//       The banner persists until the user fixes the problem or dismisses it.
//
// NAMING: the COMPONENT is PageMessageBanner (it renders the banner); the
//   TYPE it displays is PageMessage (shared/types/uiTypes.ts) — distinct names,
//   so no import aliasing is ever needed.
//
// ARCHITECTURE NOTE (cc27 / State Management / Toasts and Page Messages):
//   Message responsibility is split across three levels:
//
//   Toasts (fired by orchestration hooks via app/Notifications.tsx) — ACTION
//   OUTCOMES:
//     "Order saved successfully."  /  "Approval failed: …"
//     Transient; survive navigation (the toast portal is above the router).
//
//   PageMessageBanner (here) — in-page state the user must act on:
//     "Please correct the highlighted errors and try again."
//     Must persist NEXT TO THE FORM while the user fixes it — which is
//     exactly why it is a banner, not a toast.
//
//   Business Components — field-level indicators only:
//     Red border on an invalid field; field-level error text from
//     React Hook Form.
//
//   The Page orchestration hook owns the PageMessage state:
//     const [pageMessage, setPageMessage] = useState<PageMessage | null>(null)
//   The Page JSX renders it:
//     <PageMessageBanner message={pageMessage} onDismiss={() => setPageMessage(null)} />
//
// IMPLEMENTATION — ui/alert:
//   Composes the ui/alert vendor-zone component. The stock Alert knows only
//   default/destructive, so the success / warning / info looks are supplied
//   as utility classes selected FROM DATA (message.type chooses the class —
//   the data-driven class rule, cc27 / Styling). Icons are lucide, matching
//   the vendor-zone components. The dismiss control sits in AlertAction.
//
// TECHNICAL COMPONENT: pure props in, events out. No internal state.
//
// SEE ALSO:
//   shared/types/uiTypes.ts — the PageMessage and MessageType types
//   app/Notifications.tsx   — the toast gateway for action outcomes
// =============================================================================

import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { Alert, AlertAction, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { MessageType, PageMessage } from '@/shared/types/uiTypes'

interface PageMessageBannerProps {
  message: PageMessage | null
  onDismiss: () => void
}

// The data chooses the class (cc27 / Styling): per-type colour classes for
// the Alert, built on the RA's semantic intent tokens (--success/--warning/
// --info, DECISIONS-LOG D17) with opacity modifiers — the tokens flip for
// dark mode, so no dark: variants are needed here. 'error' uses the stock
// destructive variant, so no classes.
const TYPE_CLASS: Record<MessageType, string> = {
  success: 'border-success/40 bg-success/10 text-success',
  error:   '',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info:    'border-info/40 bg-info/10 text-info',
}

const TYPE_ICON: Record<MessageType, React.ReactNode> = {
  success: <CircleCheck />,
  error:   <CircleAlert />,
  warning: <TriangleAlert />,
  info:    <Info />,
}

// TECHNICAL COMPONENT: receives everything via props, raises events to parent.
export function PageMessageBanner({ message, onDismiss }: PageMessageBannerProps) {
  if (!message) return null

  return (
    <Alert
      variant={message.type === 'error' ? 'destructive' : 'default'}
      className={`mb-5 ${TYPE_CLASS[message.type]}`}
      aria-live="polite"
    >
      {TYPE_ICON[message.type]}
      <AlertTitle>{message.text}</AlertTitle>
      <AlertAction>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="text-current"
        >
          <X />
        </Button>
      </AlertAction>
    </Alert>
  )
}
