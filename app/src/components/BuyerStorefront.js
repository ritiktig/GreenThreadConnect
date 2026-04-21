import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuyerStorefront.css';
import ProductDetails from './ProductDetails';
import { useCurrency } from '../context/CurrencyContext';

function BuyerStorefront({ addToCart }) {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  

  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Data Loading
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/api/products?page=${page}&limit=12`);
        
        if (page === 1) {
            setProducts(response.data.products);
            if (response.data.products?.length > 0) {
                setRecommendations(response.data.products.slice(0, 2));
            }
        } else {
            setProducts(prev => [...prev, ...response.data.products]);
        }
        
        setHasMore(page < response.data.totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [page]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="storefront">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Curated Sustainable Goods</h1>
          <p>Discover unique, handmade products from eco-conscious artisans.</p>
        </div>
      </div>

      <div className="store-container">
        {/* Filters */}
          <div className="filters-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ padding: '0.6rem', borderRadius: '20px', border: '1px solid #ccc', minWidth: '250px', outline: 'none' }}
            />
            <button onClick={() => setCategory('All')} className={`filter-btn ${category === 'All' ? 'active' : ''}`}>All Collection</button>
            <button onClick={() => setCategory('Home Decor')} className={`filter-btn ${category === 'Home Decor' ? 'active' : ''}`}>Home Decor</button>
            <button onClick={() => setCategory('Textiles')} className={`filter-btn ${category === 'Textiles' ? 'active' : ''}`}>Textiles</button>
            <button onClick={() => setCategory('Pottery')} className={`filter-btn ${category === 'Pottery' ? 'active' : ''}`}>Pottery</button>
            <button onClick={() => setCategory('Jewelry')} className={`filter-btn ${category === 'Jewelry' ? 'active' : ''}`}>Jewelry</button>
            <button onClick={() => setCategory('Art')} className={`filter-btn ${category === 'Art' ? 'active' : ''}`}>Art</button>
          </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h3 className="section-title">✨ Selected For You</h3>
            <div className="products-grid">
              {recommendations.map(prod => (
                <div key={`rec-${prod._id}`} className="store-card" onClick={() => setSelectedProduct(prod)}>
                  <div className="store-card-img-wrapper">
                    <div className="badge-overlay">Top Pick</div>
                    <img src={prod.imageUrl || 'https://via.placeholder.com/300'} alt={prod.name} loading="lazy" className="store-card-img" />
                  </div>
                  <div className="store-card-content">
                    <h4>{prod.name}</h4>
                    <p className="store-card-artisan">By: {prod.seller ? prod.seller.name : 'Unknown Artisan'}</p>
                    <p className="store-card-category">{prod.category}</p>
                    <div className="store-card-bottom">
                      <span className="store-card-price">{formatPrice(prod.price)}</span>
                      <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(prod); }}>+ Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <h3 className="section-title">Browse Collection</h3>
          <div className="products-grid">
            {filteredProducts.map(prod => (
              <div key={prod._id} className="store-card" onClick={() => setSelectedProduct(prod)}>
                 <div className="store-card-img-wrapper">
                    <img src={prod.imageUrl || 'https://via.placeholder.com/300'} alt={prod.name} loading="lazy" className="store-card-img" />
                  </div>
                  <div className="store-card-content">
                    <h4>{prod.name}</h4>
                     <p className="store-card-artisan">By: {prod.seller ? prod.seller.name : 'Unknown Artisan'}</p>
                    <p className="store-card-category">{prod.category || 'Artisan'}</p>
                    <div className="store-card-bottom">
                      <span className="store-card-price">{formatPrice(prod.price)}</span>
                      <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(prod); }}>+ Add</button>
                    </div>
                  </div>
              </div>
            ))}
          </div>

          {hasMore && filteredProducts.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                 <button 
                    onClick={() => setPage(p => p + 1)} 
                    className="add-btn" 
                    style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', width: 'auto' }}
                 >
                    Load More Products
                 </button>
              </div>
          )}
        </section>
      </div>

      {selectedProduct && (
        <ProductDetails 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAddToCart={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
            }} 
        />
      )}
    </div>
  );
}

export default BuyerStorefront;
