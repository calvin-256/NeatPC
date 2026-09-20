// ===========================================
// NeatPC — Custom 404 Page
// ===========================================

import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.glitch}>
        <span className={styles.code}>404</span>
      </div>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primaryBtn}>
          <Home size={16} />
          Go Home
        </Link>
        <Link href="/search" className={styles.secondaryBtn}>
          <Search size={16} />
          Browse Deals
        </Link>
      </div>
    </div>
  );
}
