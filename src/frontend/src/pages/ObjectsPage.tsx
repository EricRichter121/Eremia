import { useEffect, useState } from 'react'

import AstronomicalObjectCard from '../components/AstronomicalObjectCard'
import AstronomicalObjectCardSkeleton from '../components/AstronomicalObjectCardSkeleton'
import {
  getFavoriteErrorMessage,
  useFavoriteMutations,
  useFavorites,
} from '../hooks/useFavorites'
import {
  ASTRONOMICAL_OBJECTS_PAGE_SIZE,
  useAstronomicalObjects,
  useObjectTypes,
} from '../hooks/useAstronomicalObjects'

interface ObjectsPageProps {
  onRequestSignIn: () => void
}

function ObjectsPage({ onRequestSignIn }: ObjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [objectTypeId, setObjectTypeId] = useState<number | undefined>()
  const [skip, setSkip] = useState(0)
  const {
    data: objectPage,
    error,
    isError,
    isPending,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useAstronomicalObjects({
    search: debouncedSearchTerm,
    objectTypeId,
    skip,
    limit: ASTRONOMICAL_OBJECTS_PAGE_SIZE,
  })
  const {
    data: objectTypes,
    isError: isObjectTypesError,
    refetch: refetchObjectTypes,
  } = useObjectTypes()
  const objects = objectPage?.objects
  const hasActiveFilters = Boolean(debouncedSearchTerm || objectTypeId)
  const isSearchDebouncing = searchTerm.trim() !== debouncedSearchTerm

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchTerm])

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

  function updateSearchTerm(value: string) {
    setSearchTerm(value)
    setSkip(0)
  }

  function updateObjectType(value: string) {
    setObjectTypeId(value ? Number(value) : undefined)
    setSkip(0)
  }

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
              Page {Math.floor(skip / ASTRONOMICAL_OBJECTS_PAGE_SIZE) + 1}
            </p>
          )}
        </div>

        {!isPending && !isError && (
          <div className="catalog__toolbar">
            <div className="catalog__controls">
              <label className="catalog-search">
                <span className="catalog-search__label">Search the archive</span>
                <span className="catalog-search__control">
                  <input
                    className="catalog-search__input"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => updateSearchTerm(event.target.value)}
                    placeholder="Name, identifier, type, or description"
                  />
                </span>
                <span className="catalog-search__hint">
                  Search across catalog records.
                </span>
              </label>
              <label className="catalog-filter">
                <span className="catalog-search__label">Object type</span>
                <select
                  className="catalog-filter__select"
                  value={objectTypeId ?? ''}
                  onChange={(event) => updateObjectType(event.target.value)}
                >
                  <option value="">All types</option>
                  {objectTypes?.map((objectType) => (
                    <option key={objectType.id} value={objectType.id}>
                      {objectType.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="catalog__toolbar-status">
              {objects && (
                <p className="catalog__count" aria-live="polite">
                  {objects.length} {objects.length === 1 ? 'record' : 'records'} on this page
                </p>
              )}
              {(isSearchDebouncing || isFetching) && (
                <p className="catalog__loading" role="status">
                  Updating results…
                </p>
              )}
            </div>
          </div>
        )}

        {isObjectTypesError && !isPending && !isError && (
          <div className="catalog-message catalog-message--error" role="status">
            <p>Object type filters could not be loaded.</p>
            <button
              className="retry-button"
              type="button"
              onClick={() => void refetchObjectTypes()}
            >
              Retry object types
            </button>
          </div>
        )}

        {isPending && (
          <div
            className="object-grid"
            role="status"
            aria-label="Loading astronomical objects"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <AstronomicalObjectCardSkeleton key={index} />
            ))}
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

        {!isPending && !isError && objects?.length === 0 && !hasActiveFilters && skip === 0 && (
          <div className="catalog-message">
            <h2>No objects yet</h2>
            <p>The catalog is empty.</p>
          </div>
        )}

        {!isPending && !isError && objects?.length === 0 && hasActiveFilters && (
          <div className="catalog-message">
            <h2>No matching records</h2>
            <p>Try another name or object type.</p>
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

        {!isPending && !isError && skip > 0 && objects?.length === 0 && (
          <div className="catalog-message">
            <h2>No records on this page</h2>
            <p>Return to the previous page to continue browsing.</p>
          </div>
        )}

        {!isPending && !isError && objectPage && (skip > 0 || objectPage.hasNextPage) && (
          <nav className="catalog-pagination" aria-label="Catalog pagination">
            <button
              className="auth-button"
              type="button"
              disabled={skip === 0 || isFetching || isPlaceholderData}
              onClick={() =>
                setSkip((currentSkip) =>
                  Math.max(0, currentSkip - ASTRONOMICAL_OBJECTS_PAGE_SIZE),
                )
              }
            >
              Previous
            </button>
            <span>
              Page {Math.floor(skip / ASTRONOMICAL_OBJECTS_PAGE_SIZE) + 1}
            </span>
            <button
              className="auth-button"
              type="button"
              disabled={!objectPage.hasNextPage || isFetching || isPlaceholderData}
              onClick={() =>
                setSkip((currentSkip) => currentSkip + ASTRONOMICAL_OBJECTS_PAGE_SIZE)
              }
            >
              Next
            </button>
          </nav>
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