import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Badge, Button } from '@/components/ui';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }

  // Find user and their data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      savedProducts: {
        include: {
          product: true,
        },
      },
      priceAlerts: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/api/auth/signin');
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
        {session.user.image && (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User'} 
            style={{ width: '80px', height: '80px', borderRadius: '50%' }}
          />
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Welcome back, {session.user.name || 'User'}!</h1>
          <p style={{ color: '#a1a1aa', margin: '0.5rem 0 0 0' }}>Manage your saved deals and price alerts.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        
        {/* Sidebar / Nav (simplified for single page layout) */}
        <aside style={{ flex: '1 1 250px' }}>
          <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button variant="primary" style={{ justifyContent: 'flex-start' }}>Saved Deals</Button>
            <Button variant="outline" style={{ justifyContent: 'flex-start', border: 'none' }}>Price Alerts</Button>
            <Button variant="outline" style={{ justifyContent: 'flex-start', border: 'none' }}>Chat History</Button>
            <Button variant="outline" style={{ justifyContent: 'flex-start', border: 'none' }}>Settings</Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div style={{ flex: '3 1 600px', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Saved Deals Section */}
          <section id="saved-deals">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Saved Deals ({user.savedProducts.length})</h2>
            </div>
            
            {user.savedProducts.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {user.savedProducts.map(saved => (
                  <ProductCard key={saved.id} {...saved.product} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <h3 style={{ color: '#a1a1aa', margin: 0 }}>No saved deals yet</h3>
                <p style={{ color: '#52525b', marginTop: '0.5rem' }}>Products you save while browsing will appear here.</p>
              </div>
            )}
          </section>

          {/* Price Alerts Section */}
          <section id="price-alerts">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Active Price Alerts ({user.priceAlerts.filter(a => a.isActive).length})</h2>
            </div>
            
            <div className="card">
              {user.priceAlerts.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #27272a', color: '#a1a1aa' }}>
                      <th style={{ padding: '1rem' }}>Product</th>
                      <th style={{ padding: '1rem' }}>Target Price</th>
                      <th style={{ padding: '1rem' }}>Current Best</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.priceAlerts.map(alert => (
                      <tr key={alert.id} style={{ borderBottom: '1px solid #27272a' }}>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>{alert.product.name}</td>
                        <td style={{ padding: '1rem' }}>${alert.targetPrice.toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>
                          ${alert.product.bestPrice.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {alert.triggered ? (
                            <Badge variant="outline" style={{ color: '#f59e0b', borderColor: '#f59e0b' }}>Triggered</Badge>
                          ) : alert.isActive ? (
                            <Badge variant="outline" style={{ color: '#10b981', borderColor: '#10b981' }}>Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <h3 style={{ color: '#a1a1aa', margin: 0 }}>No price alerts</h3>
                  <p style={{ color: '#52525b', marginTop: '0.5rem' }}>Set alerts on product pages to get notified of price drops.</p>
                </div>
              )}
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
