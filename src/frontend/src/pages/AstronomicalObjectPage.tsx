import axios from 'axios'
import { useParams, Link } from 'react-router-dom'

import FavoriteButton from '../components/FavoriteButton'
import {
  getFavoriteErrorMessage,
  useFavoriteMutations,
  useFavorites,
} from '../hooks/useFavorites'
import { useAstronomicalObject } from '../hooks/useAstronomicalObjects'

interface AstronomicalObjectPageProps {
  onRequestSignIn: () => void
}

const planetaryMeasurements = [
  ['Mass', 'mass_earth', 'Earth masses'],
  ['Radius', 'radius_earth', 'Earth radii'],
  ['Orbital period', 'orbital_period_days', 'days'],
  ['Semi-major axis', 'semi_major_axis_au', 'AU'],
  ['Eccentricity', 'eccentricity', ''],
  ['Inclination', 'inclination_deg', '°'],
  ['Equilibrium temperature', 'equilibrium_temperature_k', 'K'],
  ['Insolation flux', 'insolation_flux_earth', 'Earth units'],
] as const

function formatDiscoveryDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function AstronomicalObjectPage({
  onRequestSignIn,
}: AstronomicalObjectPageProps) {
  const { objectId: objectIdParam } = useParams()
  const parsedObjectId = objectIdParam && /^\d+$/.test(objectIdParam)
    ? Number(objectIdParam)
    : Number.NaN
  const objectId =
    Number.isSafeInteger(parsedObjectId) && parsedObjectId > 0
      ? parsedObjectId
      : undefined
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
    <main className="catalog">
      <Link className="object-detail__back" to="/objects">
        Back to catalog
      </Link>

      {objectId !== undefined && isPending && (
        <div className="catalog-message" role="status">
          <p>Loading astronomical object...</p>
        </div>
      )}

      {(objectId === undefined || (isError && isNotFound)) && (
        <div className="catalog-message">
          <h1>Object not found</h1>
          <p>This astronomical object does not exist in the catalog.</p>
        </div>
      )}

      {isError && !isNotFound && (
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
        <article className="object-detail">
          <header className="object-detail__heading">
            <div>
              <p className="eyebrow">{object.object_type.name}</p>
              <h1>{object.name}</h1>
              <p className="object-detail__catalog-id">
                {object.catalog_id ?? 'Identifier unavailable'}
              </p>
            </div>
            <FavoriteButton
              isFavorite={isFavorite}
              canManageFavorites={Boolean(user)}
              favoritesLoading={
                Boolean(user) && (isFavoritesPending || isUserPending)
              }
              mutationPending={mutations.isPending}
              onAddFavorite={() => mutations.addFavorite(object.id)}
              onRemoveFavorite={() => mutations.removeFavorite(object.id)}
              onRequestSignIn={onRequestSignIn}
            />
          </header>

          <section className="object-detail__section">
            <h2>Overview</h2>
            <p className={object.description ? '' : 'object-detail__empty'}>
              {object.description || 'No description available.'}
            </p>
            {object.object_type.description && (
              <p className="object-detail__type-description">
                {object.object_type.description}
              </p>
            )}
          </section>

          <section className="object-detail__section">
            <h2>Record information</h2>
            <dl className="object-detail__metadata">
              <div>
                <dt>Record ID</dt>
                <dd>{object.id}</dd>
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

          <section className="object-detail__section">
            <h2>Planetary parameters</h2>
            {object.planetary_parameters ? (
              <dl className="object-detail__metadata">
                {planetaryMeasurements.map(([label, key, unit]) => {
                  const value = object.planetary_parameters?.[key]
                  if (value === null || value === undefined) return null

                  return (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{unit ? `${value} ${unit}` : value}</dd>
                    </div>
                  )
                })}
              </dl>
            ) : (
              <p className="object-detail__empty">
                No planetary parameters are recorded for this object.
              </p>
            )}
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
