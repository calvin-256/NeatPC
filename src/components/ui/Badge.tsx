// ===========================================
// NeatPC — Badge Component
// ===========================================

import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'outline';
  size?: 'sm' | 'md';
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
