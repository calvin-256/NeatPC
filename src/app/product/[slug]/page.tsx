import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import { Badge, Button } from '@/components/ui';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Fetch the product with all its pricing and history data
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      prices: true,
      priceHistory: {
        orderBy: { recordedAt: 'asc' },
        take: 30 // Last 30 records
      },
    },
  });

  if (!product) {
    return notFound();
  }

  // Parse specs JSON
  let specs: Record<string, string> = {};
  try {
    specs = JSON.parse(product.specsJson);
  } catch (e) {
    console.error("Failed to parse specs");
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Top Header / Hero */}
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <div style={{ flex: '1 1 400px', backgroundColor: '#18181b', borderRadius: '12px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#52525b' }}>No image available</div>
          )}
        </div>
        
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a1a1aa' }}>{product.brand}</span>
            <Badge variant="outline">{product.category}</Badge>
            <Badge variant={product.dealScore >= 75 ? 'default' : 'outline'} style={{ marginLeft: 'auto' }}>
              Deal Score: {product.dealScore}/100
            </Badge>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', lineHeight: '1.2', margin: 0 }}>{product.name}</h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: '1.6' }}>{product.description}</p>
          
          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>Current Best Price</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                {product.bestPrice > 0 ? `$${product.bestPrice.toFixed(2)}` : 'Out of Stock'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button variant="outline">Save Deal</Button>
              <Button variant="primary" size="lg">Compare Retailers</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        
        {/* Left Column: Specs */}
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Specifications</h2>
          <div className="card">
            {Object.keys(specs).length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(specs).map(([key, value], idx) => (
                    <tr key={key} style={{ borderBottom: idx !== Object.keys(specs).length - 1 ? '1px solid #27272a' : 'none' }}>
                      <td style={{ padding: '12px 0', color: '#a1a1aa', fontWeight: '500', width: '40%' }}>{key}</td>
                      <td style={{ padding: '12px 0', color: '#f4f4f5' }}>{value as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#a1a1aa' }}>Detailed specifications not available.</p>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & History */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Retailers List */}
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Where to Buy</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {product.prices.length > 0 ? (
                product.prices.map(price => (
                  <div key={price.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '600', textTransform: 'capitalize' }}>{price.retailer}</span>
                      {price.inStock ? (
                        <Badge variant="outline" style={{ color: '#10b981', borderColor: '#10b981' }}>In Stock</Badge>
                      ) : (
                        <Badge variant="outline" style={{ color: '#ef4444', borderColor: '#ef4444' }}>Out of Stock</Badge>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>${price.price.toFixed(2)}</span>
                      <a href={price.url} target="_blank" rel="noopener noreferrer">
                        <Button variant={price.price === product.bestPrice && price.inStock ? 'primary' : 'outline'}>
                          Buy Now
                        </Button>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#a1a1aa' }}>Currently unavailable at tracked retailers.</p>
              )}
            </div>
          </div>

          {/* Price History Chart */}
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>30-Day Price History</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <PriceHistoryChart 
                data={product.priceHistory.map(h => ({
                  recordedAt: h.recordedAt.toISOString(),
                  price: h.price,
                  retailer: h.retailer
                }))} 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
