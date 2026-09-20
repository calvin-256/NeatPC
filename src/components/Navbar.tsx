// ===========================================
// NeatPC — Navbar Component
// ===========================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, User, Heart, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Browse' },
  { href: '/compare', label: 'Compare' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn, login, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          Neat<span className={styles.logoAccent}>PC</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.desktopLinks}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
          <Link href="/search" className={styles.iconBtn} aria-label="Search">
            <Search size={18} />
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={styles.iconBtn} aria-label="Saved">
                <Heart size={18} />
              </Link>
              <button className={styles.userBtn} onClick={logout}>
                {user?.image ? (
                  <img src={user.image} alt="" className={styles.avatar} />
                ) : (
                  <User size={18} />
                )}
              </button>
            </>
          ) : (
            <button className={styles.loginBtn} onClick={login}>
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileLinks}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}

            <div className={styles.mobileDivider} />

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className={styles.mobileLink} onClick={closeMenu}>
                  <Heart size={18} /> Saved Products
                </Link>
                <button className={styles.mobileLink} onClick={() => { logout(); closeMenu(); }}>
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <button className={styles.mobileLink} onClick={() => { login(); closeMenu(); }}>
                <LogIn size={18} /> Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
