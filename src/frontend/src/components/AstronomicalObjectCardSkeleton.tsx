import Skeleton from './Skeleton'

function AstronomicalObjectCardSkeleton() {
  return (
    <article className="object-card object-card--skeleton" aria-hidden="true">
      <Skeleton className="object-card-skeleton__type" width="82px" height="10px" />
      <Skeleton className="object-card-skeleton__title" width="68%" height="27px" />
      <Skeleton className="object-card-skeleton__catalog-id" width="48%" height="11px" />
      <div className="object-card-skeleton__description">
        <Skeleton width="100%" height="9px" />
        <Skeleton width="94%" height="9px" />
        <Skeleton width="78%" height="9px" />
      </div>
      <div className="object-card-skeleton__metadata">
        <div>
          <Skeleton width="54px" height="8px" />
          <Skeleton width="42px" height="9px" />
        </div>
        <div>
          <Skeleton width="70px" height="8px" />
          <Skeleton width="82px" height="9px" />
        </div>
      </div>
      <div className="object-card-skeleton__actions">
        <Skeleton width="76px" height="13px" />
        <Skeleton width="82px" height="36px" />
      </div>
    </article>
  )
}

export default AstronomicalObjectCardSkeleton
