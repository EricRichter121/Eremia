import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser, useSignOut } from '../hooks/useAuth'
import { useTheme } from '../themes/ThemeContext'
import SignUpModal from './auth/SignUpModal'

interface HeaderProps {
  onRequestSignIn: () => void
}

function Header({ onRequestSignIn }: HeaderProps) {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const { data: user, isError, isPending } = useCurrentUser()
  const signOutMutation = useSignOut()
  const { themeId, availableThemes, setTheme } = useTheme()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="wordmark" to="/objects" aria-label="Eremia catalog home">
          <span className="wordmark__mark" aria-hidden="true">E</span>
          EREMIA
        </Link>
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

          <details className="theme-picker">
            <summary
              className="theme-picker__trigger"
              aria-label={`Select theme. Current theme: ${availableThemes[themeId].name}`}
            >
              <span>{availableThemes[themeId].name}</span>
              <span className="theme-picker__chevron" aria-hidden="true" />
            </summary>
            <div className="theme-picker__menu" aria-label="Available themes">
              {Object.entries(availableThemes).map(([id, theme]) => (
                <button
                  key={id}
                  className="theme-picker__option"
                  type="button"
                  aria-pressed={themeId === id}
                  onClick={(event) => {
                    setTheme(id)
                    event.currentTarget.closest('details')?.removeAttribute('open')
                  }}
                >
                  {theme.name}
                  {themeId === id && (
                    <span className="theme-picker__selected" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </details>
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