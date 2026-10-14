import { Link } from 'react-router-dom'

import AstronomicalObjectCard from '../components/AstronomicalObjectCard'
import {
  getFavoriteErrorMessage,
  useFavoriteMutations,
  useFavorites,
} from '../hooks/useFavorites'

interface FavoritesPageProps {
  onRequestSignIn: () => void
}

function FavoritesPage({ onRequestSignIn }: FavoritesPageProps) {
  const {
    data: favorites,
    error,
    isError,
    isPending,
    refetch,
    user,
    isUserPending,
    isUserError,
    refetchUser,
  } = useFavorites()
  const mutations = useFavoriteMutations()

  return (
    <main className="catalog">
      <div className="catalog__heading">
        <div>
          <p className="eyebrow">Your collection</p>
          <h1>Favorites</h1>
        </div>
        {!isPending && !isError && user && (
          <p className="catalog__count">
            {favorites?.length ?? 0}{' '}
            {favorites?.length === 1 ? 'object' : 'objects'}
          </p>
        )}
      </div>

      {(isUserPending || isPending) && (
        <div className="catalog-message" role="status">
          <p>Loading your favorites…</p>
        </div>
      )}

      {!isUserPending && isUserError && (
        <div className="catalog-message catalog-message--error" role="alert">
          <h2>Account status unavailable</h2>
          <p>Please try again in a moment.</p>
          <button
            className="retry-button"
            type="button"
            onClick={() => void refetchUser()}
          >
            Try again
          </button>
        </div>
      )}

      {!isUserPending && !isUserError && !user && (
        <div className="catalog-message">
          <h2>Sign in to see your favorites</h2>
          <p>Your saved astronomical objects will appear here.</p>
          <button
            className="auth-button auth-button--primary"
            type="button"
            onClick={onRequestSignIn}
          >
            Sign In
          </button>
        </div>
      )}

      {user && isError && (
        <div className="catalog-message catalog-message--error" role="alert">
          <h2>Favorites unavailable</h2>
          <p>
            {error instanceof Error
              ? error.message
              : 'Your favorites could not be loaded.'}
          </p>
          <button
            className="retry-button"
            type="button"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </div>
      )}

      {mutations.error && user && (
        <div className="catalog-message catalog-message--error" role="alert">
          <p>{getFavoriteErrorMessage(mutations.error)}</p>
          <button
            className="retry-button"
            type="button"
            onClick={mutations.resetError}
          >
            Dismiss
          </button>
        </div>
      )}

      {user && !isPending && !isError && favorites?.length === 0 && (
        <div className="catalog-message">
          <h2>No favorites yet</h2>
          <p>Save objects from the catalog and they’ll be collected here.</p>
          <Link className="auth-button auth-button--primary" to="/objects">
            Browse astronomical objects
          </Link>
        </div>
      )}

      {user && !isPending && !isError && favorites && favorites.length > 0 && (
        <div className="object-grid" aria-label="Favorite astronomical objects">
          {favorites.map((favorite) => (
            <AstronomicalObjectCard
              key={favorite.id}
              object={favorite.astronomical_object}
              isFavorite
              canManageFavorites
              favoritesLoading={false}
              mutationPending={mutations.isPending}
              onAddFavorite={mutations.addFavorite}
              onRemoveFavorite={mutations.removeFavorite}
              onRequestSignIn={onRequestSignIn}
            />
          ))}
        </div>
      )}
    </main>
  )
}

export default FavoritesPage
