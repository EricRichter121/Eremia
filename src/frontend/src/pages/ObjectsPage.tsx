import AstronomicalObjectCard from '../components/AstronomicalObjectCard'
import {
  getFavoriteErrorMessage,
  useFavoriteMutations,
  useFavorites,
} from '../hooks/useFavorites'
import { useAstronomicalObjects } from '../hooks/useAstronomicalObjects'

interface ObjectsPageProps {
  onRequestSignIn: () => void
}

function ObjectsPage({ onRequestSignIn }: ObjectsPageProps) {
  const { data: objects, error, isError, isPending, refetch } =
    useAstronomicalObjects()
  const {
    data: favorites,
    error: favoritesError,
    isError: isFavoritesError,
    isPending: isFavoritesPending,
    user,
    isUserPending,
    isUserError,
    refetch: refetchFavorites,
    refetchUser,
  } = useFavorites()
  const mutations = useFavoriteMutations()
  const favoriteObjectIds = new Set(
    favorites?.map((favorite) => favorite.astronomical_object.id) ?? [],
  )

  return (
    <>
      <main className="catalog">
        <div className="catalog__heading">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1>Astronomical objects</h1>
          </div>
          {!isPending && !isError && (
            <p className="catalog__count">
              {objects?.length ?? 0} {objects?.length === 1 ? 'object' : 'objects'}
            </p>
          )}
        </div>

        {isPending && (
          <div className="catalog-message" role="status">
            <p>Loading astronomical objects...</p>
          </div>
        )}

        {isError && (
          <div className="catalog-message catalog-message--error" role="alert">
            <h2>Catalog unavailable</h2>
            <p>
              {error instanceof Error
                ? error.message
                : 'The astronomical objects could not be loaded.'}
            </p>
            <button className="retry-button" type="button" onClick={() => void refetch()}>
              Try again
            </button>
          </div>
        )}

        {!isPending && !isError && objects?.length === 0 && (
          <div className="catalog-message">
            <h2>No objects yet</h2>
            <p>The catalog is empty.</p>
          </div>
        )}

        {!isPending && !isError && objects && objects.length > 0 && (
          <div className="object-grid" aria-label="Astronomical objects">
            {objects.map((object) => (
              <AstronomicalObjectCard
                key={object.id}
                object={object}
                isFavorite={favoriteObjectIds.has(object.id)}
                canManageFavorites={Boolean(user)}
                favoritesLoading={
                  Boolean(user) && (isFavoritesPending || isUserPending)
                }
                mutationPending={mutations.isPending}
                onAddFavorite={mutations.addFavorite}
                onRemoveFavorite={mutations.removeFavorite}
                onRequestSignIn={onRequestSignIn}
              />
            ))}
          </div>
        )}

        {isUserError && (
          <div className="catalog-message catalog-message--error" role="status">
            <p>Account status is unavailable. Sign in again to manage favorites.</p>
            <button
              className="retry-button"
              type="button"
              onClick={() => void refetchUser()}
            >
              Retry account status
            </button>
          </div>
        )}

        {user && isFavoritesError && (
          <div className="catalog-message catalog-message--error" role="alert">
            <p>
              {favoritesError instanceof Error
                ? favoritesError.message
                : 'Favorite status could not be loaded.'}
            </p>
            <button
              className="retry-button"
              type="button"
              onClick={() => void refetchFavorites()}
            >
              Retry favorite status
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
      </main>
    </>
  )
}

export default ObjectsPage