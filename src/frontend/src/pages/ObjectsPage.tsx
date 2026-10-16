import { useMemo, useState } from 'react'

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
  const [searchTerm, setSearchTerm] = useState('')
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
  const filteredObjects = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase()
    if (!query) return objects ?? []

    return (objects ?? []).filter((object) =>
      [
        object.name,
        object.catalog_id,
        object.object_type.name,
        object.description,
      ].some((value) => value?.toLocaleLowerCase().includes(query)),
    )
  }, [objects, searchTerm])

  return (
    <>
      <main className="catalog">
        <div className="catalog__heading">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1>Astronomical objects</h1>
            <p className="catalog__intro">
              Explore the Eremia archive of cataloged objects and their recorded properties.
            </p>
          </div>
          {!isPending && !isError && (
            <p className="catalog__count">
              {objects?.length ?? 0} {objects?.length === 1 ? 'object' : 'objects'}
            </p>
          )}
        </div>

        {!isPending && !isError && objects && objects.length > 0 && (
          <div className="catalog__toolbar">
            <label className="catalog-search">
              <span className="catalog-search__label">Search the archive</span>
              <span className="catalog-search__control">
                <input
                  className="catalog-search__input"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Name, identifier, type, or description"
                />
              </span>
              <span className="catalog-search__hint">
                Search across the records currently in the catalog.
              </span>
            </label>
            <p className="catalog__count" aria-live="polite">
              {filteredObjects.length} matching{' '}
              {filteredObjects.length === 1 ? 'record' : 'records'}
            </p>
          </div>
        )}

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

        {!isPending && !isError && objects && objects.length > 0 && filteredObjects.length === 0 && (
          <div className="catalog-message">
            <h2>No matching records</h2>
            <p>Try another name, identifier, object type, or description.</p>
          </div>
        )}

        {!isPending && !isError && objects && filteredObjects.length > 0 && (
          <div className="object-grid" aria-label="Astronomical objects">
            {filteredObjects.map((object) => (
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