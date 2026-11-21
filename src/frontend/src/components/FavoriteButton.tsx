import { useRef, useState } from 'react'

interface FavoriteButtonProps {
  isFavorite: boolean
  canManageFavorites: boolean
  favoritesLoading: boolean
  mutationPending: boolean
  onAddFavorite: () => Promise<void>
  onRemoveFavorite: () => Promise<void>
  onRequestSignIn: () => void
}

function FavoriteButton({
  isFavorite,
  canManageFavorites,
  favoritesLoading,
  mutationPending,
  onAddFavorite,
  onRemoveFavorite,
  onRequestSignIn,
}: FavoriteButtonProps) {
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(
    null,
  )
  const [interactionPending, setInteractionPending] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<
    'adding' | 'removing' | null
  >(null)
  const interactionPendingRef = useRef(false)
  const displayedFavorite = optimisticFavorite ?? isFavorite

  function finishInteraction() {
    interactionPendingRef.current = false
    setOptimisticFavorite(null)
    setInteractionPending(false)
    setAnimationDirection(null)
  }

  return (
    <button
      className={`favorite-button${displayedFavorite ? ' favorite-button--active' : ''}`}
      type="button"
      aria-pressed={displayedFavorite}
      disabled={
        canManageFavorites &&
        (favoritesLoading || mutationPending || interactionPending)
      }
      onClick={() => {
        if (!canManageFavorites) {
          onRequestSignIn()
        } else {
          if (interactionPendingRef.current) return

          const nextFavorite = !displayedFavorite
          interactionPendingRef.current = true
          setOptimisticFavorite(nextFavorite)
          setInteractionPending(true)
          setAnimationDirection(nextFavorite ? 'adding' : 'removing')

          const mutation = nextFavorite
            ? onAddFavorite()
            : onRemoveFavorite()
          void mutation.then(finishInteraction, finishInteraction)
        }
      }}
    >
      <span
        className={
          animationDirection
            ? `favorite-button__icon favorite-button__icon--${animationDirection}`
            : 'favorite-button__icon'
        }
        aria-hidden="true"
      >
        {displayedFavorite ? '★' : '☆'}
      </span>
      {favoritesLoading
        ? 'Loading favorites…'
        : displayedFavorite
          ? 'Remove favorite'
          : canManageFavorites
            ? 'Add to favorites'
            : 'Sign in to favorite'}
    </button>
  )
}

export default FavoriteButton
