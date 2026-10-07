import axios from 'axios'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { useRegister } from '../../hooks/useAuth'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSignIn: () => void
}

function getRegistrationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<{ detail?: unknown }>(error)) {
    return 'Registration failed. Please try again.'
  }

  const detail = error.response?.data?.detail
  if (
    typeof detail === 'string' &&
    detail.toUpperCase().includes('REGISTER_USER_ALREADY_EXISTS')
  ) {
    return 'An account with this email already exists.'
  }

  if (error.response?.status === 422) {
    return 'Please check your email and password and try again.'
  }

  return 'Registration failed. Please try again.'
}

function SignUpModal({ isOpen, onClose, onSignIn }: SignUpModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const registerMutation = useRegister()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  function resetForm() {
    setEmail('')
    setPassword('')
    setPasswordConfirmation('')
    setErrorMessage(null)
    setIsRegistered(false)
  }

  function handleClose() {
    if (registerMutation.isPending) return

    resetForm()
    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (registerMutation.isPending) return

    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage('Enter your email address.')
      return
    }

    if (emailInputRef.current?.validity.typeMismatch) {
      setErrorMessage('Enter a valid email address.')
      return
    }

    if (!password) {
      setErrorMessage('Enter a password.')
      return
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      await registerMutation.mutateAsync({ email: email.trim(), password })
      setEmail('')
      setPassword('')
      setPasswordConfirmation('')
      setIsRegistered(true)
    } catch (error) {
      setErrorMessage(getRegistrationErrorMessage(error))
    }
  }

  function handleSignIn() {
    resetForm()
    onSignIn()
  }

  return (
    <dialog
      ref={dialogRef}
      className="sign-in-dialog"
      aria-labelledby="sign-up-title"
      onCancel={(event) => {
        event.preventDefault()
        handleClose()
      }}
    >
      <section className="sign-in-dialog__content">
        <header className="sign-in-dialog__header">
          <div>
            <p className="eyebrow">{isRegistered ? 'Account created' : 'Join Eremia'}</p>
            <h2 id="sign-up-title">
              {isRegistered ? 'You’re all set' : 'Create an account'}
            </h2>
          </div>
          <button
            className="sign-in-dialog__close"
            type="button"
            aria-label="Close sign up"
            disabled={registerMutation.isPending}
            onClick={handleClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {isRegistered ? (
          <div className="sign-up-success" role="status">
            <p>Your account was created. Sign in to continue.</p>
            <button
              className="auth-button auth-button--primary sign-in-form__submit"
              type="button"
              onClick={handleSignIn}
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form className="sign-in-form" noValidate onSubmit={handleSubmit}>
            <fieldset disabled={registerMutation.isPending}>
              <label className="sign-in-form__field">
                <span>Email</span>
                <input
                  ref={emailInputRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="sign-in-form__field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <label className="sign-in-form__field">
                <span>Confirm password</span>
                <input
                  type="password"
                  name="password-confirmation"
                  autoComplete="new-password"
                  required
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                />
              </label>
            </fieldset>

            {errorMessage && (
              <p className="sign-in-form__error" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              className="auth-button auth-button--primary sign-in-form__submit"
              type="submit"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating Account…' : 'Sign Up'}
            </button>
          </form>
        )}
      </section>
    </dialog>
  )
}

export default SignUpModal
