// ===========================================
// NeatPC — Global Loading State
// ===========================================
// Shown automatically by Next.js during route transitions.

import Skeleton from '@/components/ui/Skeleton';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <Skeleton width="60%" height="3rem" borderRadius="12px" />
        <Skeleton width="40%" height="1.2rem" />
        <Skeleton width="35%" height="1.2rem" />
      </div>

      <div className={styles.grid}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.card}>
            <Skeleton height="180px" borderRadius="12px 12px 0 0" />
            <div className={styles.cardBody}>
              <Skeleton width="35%" height="0.7rem" />
              <Skeleton width="80%" height="1.1rem" />
              <Skeleton width="55%" height="0.85rem" />
              <div className={styles.cardFooter}>
                <Skeleton width="30%" height="1.2rem" />
                <Skeleton width="80px" height="36px" borderRadius="10px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
