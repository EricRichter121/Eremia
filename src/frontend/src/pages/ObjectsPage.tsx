import { useAstronomicalObjects } from '../hooks/useAstronomicalObjects'

function formatDiscoveryDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function ObjectsPage() {
  const { data: objects, error, isError, isPending, refetch } =
    useAstronomicalObjects()

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
              <article className="object-card" key={object.id}>
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
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default ObjectsPage