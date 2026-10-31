import type { CSSProperties } from 'react'

type SkeletonProps = {
  className?: string
  height?: CSSProperties['height']
  radius?: CSSProperties['borderRadius']
  variant?: 'block' | 'circle'
  width?: CSSProperties['width']
}

function Skeleton({
  className = '',
  height,
  radius,
  variant = 'block',
  width,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton skeleton--${variant}${className ? ` ${className}` : ''}`}
      style={{
        height,
        width,
        borderRadius: radius ?? (variant === 'circle' ? '50%' : 'var(--shape-control)'),
      }}
    />
  )
}

export default Skeleton
