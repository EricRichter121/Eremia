import axios from 'axios'
import { Link, useParams } from 'react-router-dom'

import {
  getFavoriteErrorMessage,
  useFavoriteMutations,
  useFavorites,
} from '../hooks/useFavorites'
import { useAstronomicalObject } from '../hooks/useAstronomicalObjects'

interface AstronomicalObjectPageProps {
  onRequestSignIn: () => void
}

function parseObjectId(value: string | undefined): number | undefined {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined

  const objectId = Number(value)
  return Number.isSafeInteger(objectId) ? objectId : undefined
}

function formatDiscoveryDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function AstronomicalObjectPage({
  onRequestSignIn,
}: AstronomicalObjectPageProps) {
  const { objectId: objectIdParam } = useParams()
  const objectId = parseObjectId(objectIdParam)
  const {
    data: object,
    error,
    isError,
    isPending,
    refetch,
  } = useAstronomicalObject(objectId)
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
  const isFavorite = favorites?.some(
    (favorite) => favorite.astronomical_object.id === object?.id,
  ) ?? false
  const isNotFound =
    objectId === undefined ||
    (axios.isAxiosError(error) && error.response?.status === 404)

  return (
    <main className="catalog object-detail">
      <Link className="object-detail__back-link" to="/objects">
        <span aria-hidden="true">←</span> Back to catalog
      </Link>

      {objectId !== undefined && isPending && (
        <div className="catalog-message" role="status">
          <p>Loading astronomical object...</p>
        </div>
      )}

      {isNotFound && (
        <div className="catalog-message">
          <h1>Object not found</h1>
          <p>This catalog record does not exist or is no longer available.</p>
          <Link className="auth-button auth-button--primary" to="/objects">
            Browse the catalog
          </Link>
        </div>
      )}

      {objectId !== undefined && isError && !isNotFound && (
        <div className="catalog-message catalog-message--error" role="alert">
          <h1>Object unavailable</h1>
          <p>
            {error instanceof Error
              ? error.message
              : 'The astronomical object could not be loaded.'}
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

      {object && (
        <article className="object-detail__record">
          <header className="object-detail__heading">
            <div>
              <p className="object-card__type">{object.object_type.name}</p>
              <h1>{object.name}</h1>
              <p className="object-detail__catalog-id">
                {object.catalog_id ?? 'Identifier unavailable'}
              </p>
            </div>
            <button
              className={`favorite-button${isFavorite ? ' favorite-button--active' : ''}`}
              type="button"
              aria-pressed={isFavorite}
              disabled={Boolean(user) && (isFavoritesPending || isUserPending || mutations.isPending)}
              onClick={() => {
                if (!user) {
                  onRequestSignIn()
                } else if (isFavorite) {
                  mutations.removeFavorite(object.id)
                } else {
                  mutations.addFavorite(object.id)
                }
              }}
            >
              <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
              {user && (isFavoritesPending || isUserPending)
                ? 'Loading favorites…'
                : isFavorite
                  ? 'Remove favorite'
                  : user
                    ? 'Add to favorites'
                    : 'Sign in to favorite'}
            </button>
          </header>

          <section className="object-detail__section" aria-labelledby="object-description">
            <h2 id="object-description">About this object</h2>
            <p>
              {object.description || 'No description is available for this object.'}
            </p>
          </section>

          <section className="object-detail__section" aria-labelledby="object-properties">
            <h2 id="object-properties">Catalog properties</h2>
            <dl className="object-detail__properties">
              <div>
                <dt>Record ID</dt>
                <dd>{object.id}</dd>
              </div>
              <div>
                <dt>Object type</dt>
                <dd>{object.object_type.name}</dd>
              </div>
              <div>
                <dt>Catalog identifier</dt>
                <dd>{object.catalog_id ?? 'Not available'}</dd>
              </div>
              <div>
                <dt>Discovered</dt>
                <dd>
                  {object.discovered_at
                    ? formatDiscoveryDate(object.discovered_at)
                    : 'Unknown'}
                </dd>
              </div>
            </dl>
          </section>
        </article>
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
  )
}

export default AstronomicalObjectPage
