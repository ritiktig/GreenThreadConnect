import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SellerAnalytics from './SellerAnalytics';
import SellerOrders from './SellerOrders';
import SellerHistory from './SellerHistory';
import { useCurrency } from '../context/CurrencyContext';
import './SellerDashboard.css';

function SellerDashboard() {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'orders'
  const [myProducts, setMyProducts] = useState([]);

  // Fetch Products
  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;
      const res = await axios.get(`/api/products/seller/${user.id}`);
      setMyProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
          <div>
            <h2>Seller Dashboard</h2>
            <p style={{ margin: '0.5rem 0 0', color: '#666' }}>Manage your sustainable business</p>
          </div>
          <Link to="/buyer" style={{ textDecoration: 'none' }}>
            <button className="view-marketplace-btn">View Marketplace</button>
          </Link>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            Ordered Products
          </button>
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
            onClick={() => setActiveTab('products')}
          >
            My Products
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            Sales History
          </button>
      </div>

      {/* Content */}
      <div className="fade-in">
        {activeTab === 'overview' && (
            <SellerAnalytics />
        )}

        {activeTab === 'orders' && (
            <SellerOrders />
        )}

        {activeTab === 'history' && (
            <SellerHistory />
        )}

        {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>My Products ({myProducts.length})</h3>
              </div>

              <div className="products-grid">
                  {myProducts.map(p => (
                      <div key={p._id} className="product-card">
                          <div className="card-image-container">
                              {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.name} className="card-image" />
                              ) : (
                                  <div className="no-image-placeholder">📦</div>
                              )}
                          </div>
                          <div className="card-content">
                              <div className="card-header">
                                  <h4 className="product-title">{p.name}</h4>
                                  <span className="product-price">{formatPrice(p.price)}</span>
                              </div>
                              {p.carbonFootprint && (
                                  <div style={{ fontSize: '0.85rem', color: '#2e7d32', marginBottom: '0.5rem' }}>
                                      🌱 {Number(p.carbonFootprint).toFixed(1)} kg CO2e
                                  </div>
                              )}
                              <div className="product-stock">
                                  <span className="stock-indicator"></span>
                                  {p.stock} in stock
                              </div>
                              
                              <div className="card-actions">
                                  <Link to={`/seller/edit-product/${p._id}`} style={{ flex: 1, textDecoration: 'none' }}>
                                      <button className="edit-btn">
                                          Edit
                                      </button>
                                  </Link>
                                  <button 
                                      className="delete-btn"
                                      onClick={async () => {
                                          if (window.confirm('Are you sure you want to delete this product?')) {
                                              try {
                                                  await axios.delete(`/api/products/${p._id}`);
                                                  setMyProducts(myProducts.filter(item => item._id !== p._id));
                                              } catch (err) {
                                                  console.error("Failed to delete", err);
                                                  alert("Failed to delete product");
                                              }
                                          }
                                      }}
                                  >
                                      Delete
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
              {myProducts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                      <p>You haven't added any products yet.</p>
                      <Link to="/seller/add-product">
                          <button className="view-marketplace-btn">Add Your First Product</button>
                      </Link>
                  </div>
              )}
            </div>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;
