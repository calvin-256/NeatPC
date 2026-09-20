// ===========================================
// NeatPC — Footer Component
// ===========================================

import Link from 'next/link';
import styles from './Footer.module.css';

const FOOTER_LINKS = {
  Product: [
    { href: '/', label: 'Quiz' },
    { href: '/search', label: 'Browse Deals' },
    { href: '/compare', label: 'Compare' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
  Connect: [
    { href: 'https://github.com', label: 'GitHub', external: true },
    { href: 'https://twitter.com', label: 'Twitter', external: true },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            Neat<span className={styles.logoAccent}>PC</span>
          </div>
          <p className={styles.tagline}>
            AI-powered deal finder. Find the best device for your needs, at the best price.
          </p>
        </div>

        <div className={styles.links}>
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>{category}</h4>
              <ul className={styles.linkList}>
                {links.map((link) => (
                  <li key={link.href}>
                    {'external' in link ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={styles.link}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} NeatPC. Prices updated regularly. Affiliate links may earn commission.
        </p>
      </div>
    </footer>
  );
}
