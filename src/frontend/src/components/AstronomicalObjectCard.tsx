import type { AstronomicalObject } from '../types/astronomicalObject'
import { Link } from 'react-router-dom'
import FavoriteButton from './FavoriteButton'

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
      <h2>
        <Link className="object-card__title-link" to={`/objects/${object.id}`}>
          {object.name}
        </Link>
      </h2>
      <p className="object-card__catalog-id" aria-label="Catalog identifier">
        {object.catalog_id ?? 'Identifier unavailable'}
      </p>
      <p
        className={`object-card__description${object.description ? '' : ' object-card__description--empty'}`}
      >
        {object.description || 'No description available.'}
      </p>
      <dl className="object-card__metadata">
        <div>
          <dt className="object-card__label">Record ID</dt>
          <dd className="object-card__date">{object.id}</dd>
        </div>
        <div>
          <dt className="object-card__label">Discovered</dt>
          <dd className="object-card__date">
            {object.discovered_at
              ? formatDiscoveryDate(object.discovered_at)
              : 'Unknown'}
          </dd>
        </div>
      </dl>
      <div className="object-card__actions">
        <Link className="object-card__details-link" to={`/objects/${object.id}`}>
          View details
        </Link>
        <FavoriteButton
          isFavorite={isFavorite}
          canManageFavorites={canManageFavorites}
          favoritesLoading={favoritesLoading}
          mutationPending={mutationPending}
          onAddFavorite={() => onAddFavorite(object.id)}
          onRemoveFavorite={() => onRemoveFavorite(object.id)}
          onRequestSignIn={onRequestSignIn}
        />
      </div>
    </article>
  )
}

export default AstronomicalObjectCard
