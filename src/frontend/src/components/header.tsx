import { useState } from 'react'
import { useCurrentUser, useSignOut } from '../hooks/useAuth'
import SignInModal from './auth/SignInModal'
import SignUpModal from './auth/SignUpModal'

function Header() {
  const [activeAuthModal, setActiveAuthModal] = useState<'sign-in' | 'sign-up' | null>(null)
  const { data: user, isError, isPending } = useCurrentUser()
  const signOutMutation = useSignOut()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="wordmark" href="/objects" aria-label="Eremia catalog home">
          <span aria-hidden="true">E</span> EREMIA
        </a>
        <div className="site-header__auth" aria-busy={isPending}>
          {isPending && <span className="auth-status-space" aria-hidden="true" />}

          {!isPending && isError && (
            <span className="auth-status-error" role="status">
              Account status unavailable
            </span>
          )}

          {!isPending && !isError && user === null && (
            <>
              <button
                className="auth-button"
                type="button"
                onClick={() => setActiveAuthModal('sign-in')}
              >
                Sign In
              </button>
              <button
                className="auth-button auth-button--primary"
                type="button"
                onClick={() => setActiveAuthModal('sign-up')}
              >
                Sign Up
              </button>
            </>
          )}

          {!isPending && !isError && user && (
            <>
              <span className="auth-user" title={user.email}>{user.email}</span>
              <button
                className="auth-button"
                type="button"
                disabled={signOutMutation.isPending}
                onClick={() => signOutMutation.mutate()}
              >
                {signOutMutation.isPending ? 'Signing Out…' : 'Sign Out'}
              </button>
            </>
          )}

          {signOutMutation.isError && (
            <span className="auth-status-error" role="alert">
              Sign out failed
            </span>
          )}
        </div>
      </div>
      <SignInModal
        isOpen={activeAuthModal === 'sign-in'}
        onClose={() => setActiveAuthModal(null)}
      />
      <SignUpModal
        isOpen={activeAuthModal === 'sign-up'}
        onClose={() => setActiveAuthModal(null)}
        onSignIn={() => setActiveAuthModal('sign-in')}
      />
    </header>
  )
}

export default Header