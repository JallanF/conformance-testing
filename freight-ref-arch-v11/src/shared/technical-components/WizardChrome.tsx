// =============================================================================
// WHAT: WizardChrome — reusable Technical Component
// ROLE: Renders the wizard step indicator, step labels, and Back/Next/Submit
//       navigation buttons. Purely presentational — knows nothing about wizard
//       content or step validation. Receives all state as props.
//
// COMPONENT HIERARCHY:
//   Page or Business Component (orchestrates wizard steps)
//     WizardChrome (Technical Component — this file — chrome and navigation)
//       [Step content rendered by parent as children]
//
// WIZARD PATTERN (cc27 / Screen Composition / Wizard Pattern):
//   A wizard is an orchestration pattern applicable at any level:
//     Page level:      CreateOrderPage + useCreateOrderPage()
//     Component level: AllocationWizard (Business Component)
//     Modal level:     AddAllocationModal (Business Component)
//
//   In all cases:
//   - The orchestrating layer (Page hook or Business Component) owns currentStep
//   - Each step is a Business Component following the pull pattern (getData/reset)
//   - WizardChrome (this file) is the shared presentational chrome
//   - Back/Next/Submit are events raised to the orchestrating layer
//
// BACK/NEXT INTERACTION:
//   The parent's Next handler calls getData() on the current step ref to
//   validate. If isValid: false, the step displays its own errors and the
//   orchestrator does NOT advance. This component receives no feedback about
//   validation — it simply fires onNext and the parent decides whether to advance.
//
// STYLING: Tailwind utilities + ui/button. There is no wizard primitive in
//   Base UI or shadcn, so the chrome stays home-grown (DECISIONS-LOG D9).
//   Step state (active/complete) selects classes from data — the data-driven
//   class rule (cc27 / Styling).
//
// TECHNICAL COMPONENT: pure props in, events out. No internal state.
// =============================================================================

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  label: string
}

interface WizardChromeProps {
  steps: WizardStep[]
  currentStep: number          // 0-indexed
  // The step panels. The parent renders ALL steps here and hides the inactive
  // ones with a class — never unmounts them — so each step's form state and
  // ref survive Back/Next and final submit.
  children: React.ReactNode
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

// TECHNICAL COMPONENT — renders the wizard chrome around step content.
export function WizardChrome({
  steps,
  currentStep,
  children,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
}: WizardChromeProps) {
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="mb-5 overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Step indicator */}
      <div className="flex items-center gap-2 overflow-x-auto border-b bg-muted/50 px-6 py-4" role="list" aria-label="Wizard steps">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isComplete = index < currentStep

          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 text-sm whitespace-nowrap',
                  isActive ? 'font-medium text-foreground'
                    : isComplete ? 'text-muted-foreground'
                    : 'text-muted-foreground/60'
                )}
                role="listitem"
              >
                <div
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                    isActive ? 'border-primary bg-primary text-primary-foreground'
                      : isComplete ? 'border-success bg-success text-background'
                      : 'border-border'
                  )}
                >
                  {isComplete ? <Check className="size-3.5" /> : index + 1}
                </div>
                <span>{step.label}</span>
              </div>
              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div className="h-px w-8 shrink-0 bg-border" aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>

      {/* Current step content — rendered by parent */}
      <div className="p-6">
        {children}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between border-t bg-muted/50 px-6 py-4">
        {/* Back is disabled on the first step — derived from currentStep,
            which this component already receives. No separate prop needed. */}
        <Button variant="outline" onClick={onBack} disabled={currentStep === 0}>
          Back
        </Button>

        {isLastStep ? (
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </Button>
        ) : (
          <Button onClick={onNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
