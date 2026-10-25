interface FavoriteButtonProps {
  isFavorite: boolean
  canManageFavorites: boolean
  favoritesLoading: boolean
  mutationPending: boolean
  onAddFavorite: () => void
  onRemoveFavorite: () => void
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
  return (
    <button
      className={`favorite-button${isFavorite ? ' favorite-button--active' : ''}`}
      type="button"
      aria-pressed={isFavorite}
      disabled={canManageFavorites && (favoritesLoading || mutationPending)}
      onClick={() => {
        if (!canManageFavorites) {
          onRequestSignIn()
        } else if (isFavorite) {
          onRemoveFavorite()
        } else {
          onAddFavorite()
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
  )
}

export default FavoriteButton
