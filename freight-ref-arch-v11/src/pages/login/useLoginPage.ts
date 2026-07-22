// =============================================================================
// WHAT: Login page orchestration hook
// ROLE: Contains all logic for the Login page. The LoginPage component
//       contains only JSX and layout.
//
// ARCHITECTURE NOTE (cc27 / Screen Composition / The Page Orchestration Hook):
//   Every page has a corresponding use[PageName]Page() hook, even simple pages.
//   Consistency is more important than avoiding a thin hook on a simple page.
//   This hook is deliberately simple — it demonstrates the pattern without
//   overwhelming with complexity.
//
//   LoginForm is a standalone form that owns its own submit, so it delivers
//   its data by raising an onSubmit event with the validated form values
//   (standard React). This hook receives that event and calls the login
//   mutation, owning the outcome (navigate to /orders on success, show an
//   error on failure). The pull pattern is reserved for components the page
//   reads on demand — a multi-section save, a wizard-step validation, an
//   isDirty guard, or a reset — and login is none of those
//   (see cc27 / Screen Composition / Business Component Ref Contract).
// =============================================================================

import { useNavigate } from 'react-router'
import { useAuth } from '@/shared/utility-hooks/useAuth'
import { useLoginMutation } from './loginDataHooks'
import type { LoginFormValues } from './loginTypes'

export function useLoginPage() {
  const navigate = useNavigate()
  const { login: setAuthUser } = useAuth()
  const { login: callLoginApi, isPending, isError, error } = useLoginMutation()

  // Invoked when LoginForm raises its onSubmit event with validated values.
  // LoginForm does not know about this hook — it calls the onSubmit prop it
  // was handed; this handler receives the values and calls the login mutation.
  const handleSubmit = (values: LoginFormValues) => {
    callLoginApi(
      { email: values.email, password: values.password },
      {
        onSuccess: (authUser) => {
          // Store the authenticated user in AuthContext (Application State).
          // In production, the API would return a JWT token alongside the user.
          // Here we use a stub token for demonstration.
          setAuthUser(authUser, 'stub-jwt-token')
          navigate('/orders')
        },
        // onError is handled via isError/error below — displayed in LoginForm
      }
    )
  }

  return {
    // status flags
    isPending,
    isError,
    // derived
    errorMessage: isError ? (error?.message ?? 'Login failed. Please try again.') : null,
    // handlers
    handleSubmit,
  }
}
