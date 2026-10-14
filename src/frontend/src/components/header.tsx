import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser, useSignOut } from '../hooks/useAuth'
import SignUpModal from './auth/SignUpModal'

interface HeaderProps {
  onRequestSignIn: () => void
}

function Header({ onRequestSignIn }: HeaderProps) {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const { data: user, isError, isPending } = useCurrentUser()
  const signOutMutation = useSignOut()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="wordmark" href="/objects" aria-label="Eremia catalog home">
          <span aria-hidden="true">E</span> EREMIA
        </a>
        <nav className="site-header__navigation" aria-label="Main navigation">
          <Link to="/objects">Catalog</Link>
          {!isPending && !isError && user && (
            <Link to="/favorites">Favorites</Link>
          )}
        </nav>
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
                onClick={onRequestSignIn}
              >
                Sign In
              </button>
              <button
                className="auth-button auth-button--primary"
                type="button"
                onClick={() => setIsSignUpOpen(true)}
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
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignIn={() => {
          setIsSignUpOpen(false)
          onRequestSignIn()
        }}
      />
    </header>
  )
}

export default Header