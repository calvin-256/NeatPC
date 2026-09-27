'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard, { ProductCardProps } from '@/components/ProductCard';
import PageTransition from '@/components/PageTransition';
import { Button, Input } from '@/components/ui';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('dealScore');
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]); // refetch when filters change

  const fetchProducts = async (searchQuery = query) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (category) params.set('category', category);
      params.set('sort', sort);
      params.set('limit', '20');

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(query);
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Browse Deals</h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', width: '400px' }}>
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search for laptops, phones..." 
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Sidebar Filters */}
          <aside style={{ width: '250px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3>Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <label>
                  <input type="radio" name="category" checked={category === ''} onChange={() => setCategory('')} /> All
                </label>
                <label>
                  <input type="radio" name="category" checked={category === 'laptop'} onChange={() => setCategory('laptop')} /> Laptops
                </label>
                <label>
                  <input type="radio" name="category" checked={category === 'phone'} onChange={() => setCategory('phone')} /> Phones
                </label>
              </div>
            </div>

            <div className="card">
              <h3>Sort By</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <select 
                  className="input-field" 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="dealScore">Best Deals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Additions</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div style={{ flexGrow: 1 }}>
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '350px', borderRadius: '12px' }}></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {products.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2>No products found</h2>
                <p style={{ color: '#a1a1aa' }}>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
