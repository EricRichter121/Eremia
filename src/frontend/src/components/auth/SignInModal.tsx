import { useEffect, useRef, useState, type FormEvent } from 'react'

import { useSignIn } from '../../hooks/useAuth'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const signInMutation = useSignIn()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (signInMutation.isPending) return

    setErrorMessage(null)

    try {
      await signInMutation.mutateAsync({ email, password })
      setEmail('')
      setPassword('')
      onClose()
    } catch {
      setErrorMessage('Invalid email or password.')
    }
  }

  function handleClose() {
    if (signInMutation.isPending) return

    setEmail('')
    setPassword('')
    setErrorMessage(null)
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="sign-in-dialog"
      aria-labelledby="sign-in-title"
      onCancel={(event) => {
        event.preventDefault()
        handleClose()
      }}
    >
      <section className="sign-in-dialog__content">
        <header className="sign-in-dialog__header">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2 id="sign-in-title">Sign in to Eremia</h2>
          </div>
          <button
            className="sign-in-dialog__close"
            type="button"
            aria-label="Close sign in"
            disabled={signInMutation.isPending}
            onClick={handleClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form className="sign-in-form" onSubmit={handleSubmit}>
          <fieldset disabled={signInMutation.isPending}>
            <label className="sign-in-form__field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
      </section>
    </dialog>
  )
}

export default SignInModal
