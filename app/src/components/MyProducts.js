import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null); // Product being edited
  const [editForm, setEditForm] = useState({ name: '', price: '', stock: '', category: '' });

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Please login first');
        return;
      }
      const user = JSON.parse(userStr);
      
      const res = await axios.get(`/api/products/seller/${user.id}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this product?")) return;
      try {
          await axios.delete(`/api/products/${id}`);
          setProducts(products.filter(p => p._id !== id));
          alert("Product deleted successfully");
      } catch (err) {
          console.error("Failed to delete product", err);
          alert("Failed to delete product");
      }
  };

  const startEdit = (product) => {
      setEditingProduct(product);
      setEditForm({
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category || ''
      });
  };

  const handleUpdate = async () => {
      try {
          await axios.patch(`/api/products/${editingProduct._id}`, {
              name: editForm.name,
              price: parseFloat(editForm.price),
              stock: parseInt(editForm.stock),
              category: editForm.category
          });
          
          alert("Product updated successfully");
          setEditingProduct(null);
          fetchMyProducts(); // Refresh list
      } catch (err) {
          console.error("Failed to update product", err);
          alert("Failed to update product");
      }
  };

  const handleEditChange = (e) => {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard" style={{ padding: '2rem' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>My Products</h2>
          <Link to="/seller/add-product" style={{ textDecoration: 'none' }}>
            <button style={{ backgroundColor: 'var(--accent-color)' }}>+ Add New Product</button>
          </Link>
      </div>

      <div className="card">
        {loading ? (
            <p>Loading...</p>
        ) : products.length === 0 ? (
            <p>You haven't added any products yet.</p>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Image</th>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Category</th>
                        <th style={{ padding: '1rem' }}>Price</th>
                        <th style={{ padding: '1rem' }}>Stock</th>
                        <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '1rem' }}>
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                ) : (
                                    <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px' }}></div>
                                )}
                            </td>
                            <td style={{ padding: '1rem' }}>{p.name}</td>
                            <td style={{ padding: '1rem' }}>{p.category}</td>
                            <td style={{ padding: '1rem' }}>${p.price}</td>
                            <td style={{ padding: '1rem' }}>{p.stock}</td>
                            <td style={{ padding: '1rem' }}>
                                <button 
                                    onClick={() => startEdit(p)}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem', cursor: 'pointer' }}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(p._id)}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#e53935', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>

      {/* Edit Modal Overlay */}
      {editingProduct && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                  <h3>Edit Product</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                      <input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Product Name" style={{ padding: '0.5rem' }} />
                      <input name="category" value={editForm.category} onChange={handleEditChange} placeholder="Category" style={{ padding: '0.5rem' }} />
                      <input name="price" type="number" value={editForm.price} onChange={handleEditChange} placeholder="Price" style={{ padding: '0.5rem' }} />
                      <input name="stock" type="number" value={editForm.stock} onChange={handleEditChange} placeholder="Stock" style={{ padding: '0.5rem' }} />
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button onClick={handleUpdate} style={{ flex: 1, backgroundColor: '#2e7d32', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                          <button onClick={() => setEditingProduct(null)} style={{ flex: 1, backgroundColor: '#757575', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default MyProducts;
