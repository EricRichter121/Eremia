import type { AstronomicalObject } from '../types/astronomicalObject'

interface AstronomicalObjectCardProps {
  object: AstronomicalObject
  isFavorite: boolean
  canManageFavorites: boolean
  favoritesLoading: boolean
  mutationPending: boolean
  onAddFavorite: (objectId: number) => void
  onRemoveFavorite: (objectId: number) => void
  onRequestSignIn: () => void
}

function formatDiscoveryDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function AstronomicalObjectCard({
  object,
  isFavorite,
  canManageFavorites,
  favoritesLoading,
  mutationPending,
  onAddFavorite,
  onRemoveFavorite,
  onRequestSignIn,
}: AstronomicalObjectCardProps) {
  return (
    <article className="object-card">
      <p className="object-card__type">{object.object_type.name}</p>
      <h2>{object.name}</h2>
      <p className="object-card__catalog-id">
        {object.catalog_id ?? 'No catalog identifier'}
      </p>
      <p
        className={`object-card__description${object.description ? '' : ' object-card__description--empty'}`}
      >
        {object.description || 'No description available.'}
      </p>
      <div className="object-card__footer">
        <span className="object-card__label">Discovered</span>
        <span className="object-card__date">
          {object.discovered_at
            ? formatDiscoveryDate(object.discovered_at)
            : 'Unknown'}
        </span>
      </div>
      <div className="object-card__actions">
        <button
          className={`favorite-button${isFavorite ? ' favorite-button--active' : ''}`}
          type="button"
          aria-pressed={isFavorite}
          disabled={canManageFavorites && (favoritesLoading || mutationPending)}
          onClick={() => {
            if (!canManageFavorites) {
              onRequestSignIn()
            } else if (isFavorite) {
              onRemoveFavorite(object.id)
            } else {
              onAddFavorite(object.id)
            }
          }}
        >
          <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
          {favoritesLoading
            ? 'Loading favorites…'
            : isFavorite
              ? 'Remove favorite'
              : canManageFavorites
                ? 'Add to favorites'
                : 'Sign in to favorite'}
        </button>
      </div>
    </article>
  )
}

export default AstronomicalObjectCard
