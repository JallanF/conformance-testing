// =============================================================================
// WHAT: Page-local components for the Login page
// ROLE: All components used only by the Login page, bundled in the page's
//       single [PageName]Components.tsx file (cc27 / Frontend Structure).
//
// COMPONENTS IN THIS FILE:
//   LoginForm — Business Component (onSubmit event delivery, not pull pattern)
// =============================================================================

import { useForm } from 'react-hook-form'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { LoginFormValues } from './loginTypes'

// =============================================================================
// WHAT: LoginForm — Business Component
// ROLE: Renders the login form with email and password fields. Owns its
//       own form state and validation via React Hook Form. Raises an
//       onSubmit event to the parent with validated form values.
//
// NOTE — EVENT DELIVERY, NOT THE PULL PATTERN
// (cc27 / Screen Composition / Business Component Ref Contract):
//   LoginForm delivers its data by raising an onSubmit event with validated
//   values. That is standard React and the correct choice here: a standalone
//   form that owns its own submit hands its data up when the user submits.
//   The pull pattern (getData/reset/isDirty via a ref) is the deliberate
//   deviation, used only where the PAGE needs on-demand access to a
//   component's owned state — a multi-section save, a wizard-step validation,
//   an unsaved-changes/isDirty guard, or a reset. Login needs none of these,
//   so it deliberately does not expose the ref contract. This is not an
//   exception to the rule; it is the rule
//   (see cc27 / Screen Composition / Business Component Ref Contract).
//
// FORM MARKUP — shadcn Field family (cc27 / Styling):
//   Each input sits in a Field wrapper: FieldLabel, the ui/input control, and
//   FieldError. Error presentation is driven by two attributes:
//     - data-invalid on Field   → turns the label/group destructive
//     - aria-invalid on Input   → turns the control's border/ring destructive
//   FieldError renders the React Hook Form error object(s) it is given.
//   A NATIVE input still connects to React Hook Form with register() — the
//   RA's Controller rule applies to non-native controls (Select, etc.), not
//   to plain inputs (cc27 / Screen Composition / Selects and Controlled Inputs).
//
// SEE ALSO:
//   pages/login/useLoginPage.ts — receives the onSubmit event
// =============================================================================

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void
  isPending: boolean
  errorMessage: string | null
}

// BUSINESS COMPONENT — owns form state via React Hook Form.
// Raises onSubmit event to parent with validated values.
export function LoginForm({ onSubmit, isPending, errorMessage }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>()

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-5">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@freightos.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email', {
              required: 'Email address is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email address' },
            })}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password', { required: 'Password is required' })}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        {/* Page-level error from the API — shown here because LoginPage has no
            PageMessage component (it uses the login card layout, not the
            standard page layout). */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>{errorMessage}</AlertTitle>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </FieldGroup>
    </form>
  )
}
