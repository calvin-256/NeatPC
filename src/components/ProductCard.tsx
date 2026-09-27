import Link from 'next/link';
import { Badge } from '@/components/ui';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  bestPrice: number;
  dealScore: number;
  slug: string;
}

export default function ProductCard({
  id,
  name,
  brand,
  imageUrl,
  bestPrice,
  dealScore,
  slug,
}: ProductCardProps) {
  // Determine score color class
  let scoreClass = styles.scoreBadge;
  if (dealScore < 50) scoreClass += ` ${styles.poor}`;
  else if (dealScore < 75) scoreClass += ` ${styles.mediocre}`;

  return (
    <Link href={`/product/${slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={styles.image} />
        ) : (
          <span style={{ color: '#52525b' }}>No Image</span>
        )}
        <div className={scoreClass}>
          {dealScore} / 100
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.brand}>{brand}</div>
        <h3 className={styles.title}>{name}</h3>
        
        <div className={styles.footer}>
          <div>
            <div className={styles.priceLabel}>Best Price</div>
            <div className={styles.price}>
              {bestPrice > 0 ? `$${bestPrice.toFixed(2)}` : 'N/A'}
            </div>
          </div>
          
          <Badge variant="outline">View Deal</Badge>
        </div>
      </div>
    </Link>
  );
}
