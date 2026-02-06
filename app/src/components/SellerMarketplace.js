import React, { useState, useEffect } from 'react';
import axios from 'axios';


function SellerMarketplace({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Marketplace...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
          <h2>Marketplace</h2>
          <p>Explore all sustainable products available.</p>
      </div>

      <div className="card">
        <div className="product-grid">
            {products.map(p => (
                <div key={p._id} className="product-card">
                    <div style={{ height: '200px', marginBottom: '1rem', overflow: 'hidden', borderRadius: '8px' }}>
                        {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                No Image
                            </div>
                        )}
                    </div>
                    <h3>{p.name}</h3>
                    <p style={{ color: '#555', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                        By: {p.seller ? p.seller.name : 'Unknown Artisan'}
                    </p>
                    <p className="category">{p.material} | {p.region}</p>
                    <p className="price" style={{ fontSize: '1.2rem', color: '#27ae60', fontWeight: 'bold' }}>${p.price}</p>
                    <button 
                        onClick={() => addToCart(p)}
                        style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Add to Cart
                    </button>
                </div>
            ))}
        </div>
        {products.length === 0 && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No products found.</p>}
      </div>
    </div>
  );
}

export default SellerMarketplace;
