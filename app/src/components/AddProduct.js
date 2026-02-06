import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddProduct.css';

function AddProduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({ name: '', material: '', region: '', price: '', stock: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 string
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPricePrediction = async () => {
    if (!product.name || !product.material || !product.region) {
        alert('Please fill in Name, Material, and Region to get a prediction.');
        return;
    }
    setLoading(true);
    try {
        // Mock Prediction for MERN migration (Python integration pending)
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockPrice = 45 + Math.random() * 30; 
        setPrediction(mockPrice.toFixed(2));
    } finally {
        setLoading(false);
    }
  };

  const handleAddProduct = async () => {
      try {
          const userStr = localStorage.getItem('user');
          if (!userStr) {
              alert('You must be logged in to add a product.');
              return;
          }
          const user = JSON.parse(userStr);

          // Validation
          if (!product.name || !product.price || !image) {
              alert("Please fill all required fields and upload an image.");
              return;
          }

          const payload = {
              name: product.name,
              material: product.material,
              region: product.region,
              price: parseFloat(product.price),
              stock: parseInt(product.stock) || 1,
              stock: parseInt(product.stock) || 1,
              category: product.category || 'Other',
              imageUrl: image,
              seller: user.id // Mongoose expects 'seller'
          };

          await axios.post('/api/products', payload);
          alert('Product Added Successfully!');
          navigate('/seller/dashboard'); // Redirect to dashboard
          // Reset Form (Optional if redirecting, but good practice if nav fails or is delayed)
          setProduct({ name: '', material: '', region: '', price: '' });

          setImage(null);
          setPreview(null);
          setPrediction(null);
      } catch (err) {
          console.error(err);
          alert('Failed to add product');
      }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
          <h2>Add New Product</h2>
          <p>Showcase your artisan craft to the world</p>
      </div>

      <div className="add-product-card">
        <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload-area">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ display: 'none' }} 
                    id="product-image-upload"
                />
                <label htmlFor="product-image-upload" style={{ width: '100%', height: '100%', display: 'block' }}>
                    {preview ? (
                        <img src={preview} alt="Preview" className="preview-image" />
                    ) : (
                        <>
                            <div className="upload-icon">📷</div>
                            <p>Click to upload a high-quality image of your product</p>
                        </>
                    )}
                </label>
            </div>
        </div>

        <div className="form-group">
            <label>Product Name</label>
            <input 
                className="form-input"
                name="name" 
                placeholder="e.g. Handwoven Bamboo Basket" 
                value={product.name}
                onChange={handleInputChange} 
            />
        </div>

        <div className="grid-2">
            <div className="form-group">
                <label>Category</label>
                <select 
                    className="form-input"
                    name="category"
                    value={product.category}
                    onChange={handleInputChange}
                >
                    <option value="">Select Category</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Pottery">Pottery</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Art">Art</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-group">
                <label>Material</label>
                <input 
                    className="form-input"
                    name="material" 
                    placeholder="e.g. Bamboo, Silk, Clay" 
                    value={product.material}
                    onChange={handleInputChange} 
                />
            </div>

            <div className="form-group">
                <label>Region</label>
                <input 
                    className="form-input"
                    name="region" 
                    placeholder="e.g. Assam, India" 
                    value={product.region}
                    onChange={handleInputChange} 
                />
            </div>
        </div>

        {/* AI Price Prediction Section */}
        <div className="prediction-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ margin: 0, color: '#0277bd' }}>AI Fair Price Estimator</h4>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#555' }}>Get a suggested price based on material and market trends.</p>
                </div>
                <button onClick={getPricePrediction} disabled={loading} className="prediction-btn">
                     {loading ? 'Analyzing...' : 'Get Estimate'}
                </button>
            </div>
            
            {prediction && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #b3e5fc' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2E7D32' }}>${Number(prediction).toFixed(2)}</span>
                        <button 
                            onClick={() => setProduct({...product, price: prediction})}
                            style={{ background: 'none', border: 'none', color: '#0277bd', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Apply this price
                        </button>
                     </div>
                </div>
            )}
        </div>

        <div className="grid-2">
            <div className="form-group">
                <label>Price ($)</label>
                <input 
                    className="form-input"
                    name="price" 
                    type="number"
                    placeholder="0.00" 
                    value={product.price}
                    onChange={handleInputChange} 
                />
            </div>
            <div className="form-group">
                <label>Quantity (Stock)</label>
                <input 
                    className="form-input"
                    name="stock" 
                    type="number"
                    placeholder="e.g. 10" 
                    value={product.stock}
                    onChange={handleInputChange} 
                />
            </div>
        </div>

        <button onClick={handleAddProduct} className="submit-btn" disabled={loading}>
            List Product for Sale
        </button>

      </div>
    </div>
  );
}

export default AddProduct;
