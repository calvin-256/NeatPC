// ===========================================
// NeatPC — Global Error Page
// ===========================================
// Shown when an unhandled error occurs during rendering.
// Must be a client component.

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging (will be replaced with Sentry in Phase 6)
    console.error('NeatPC Error:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <AlertTriangle size={48} />
      </div>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.message}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {error.digest && (
        <p className={styles.digest}>Error ID: {error.digest}</p>
      )}
      <div className={styles.actions}>
        <button className={styles.retryBtn} onClick={reset}>
          <RefreshCw size={16} />
          Try Again
        </button>
        <Link href="/" className={styles.homeBtn}>
          <Home size={16} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
