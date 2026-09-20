// ===========================================
// NeatPC — Skeleton Loader Component
// ===========================================

import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

/** A shimmering placeholder for loading states */
export default function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '8px',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

/** Pre-built skeleton for product cards */
export function ProductCardSkeleton() {
  return (
    <div className={styles.productCard}>
      <Skeleton height="180px" borderRadius="12px 12px 0 0" />
      <div className={styles.productCardBody}>
        <Skeleton width="40%" height="0.7rem" />
        <Skeleton width="85%" height="1.1rem" />
        <Skeleton width="60%" height="0.9rem" />
        <div className={styles.productCardFooter}>
          <Skeleton width="30%" height="1.2rem" />
          <Skeleton width="25%" height="1.8rem" borderRadius="10px" />
        </div>
      </div>
    </div>
  );
}
