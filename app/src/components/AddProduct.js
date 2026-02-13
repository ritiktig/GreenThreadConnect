import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddProduct.css';

import { useCurrency } from '../context/CurrencyContext';

function AddProduct() {
  const navigate = useNavigate();
  const { formatPrice, currency, symbol } = useCurrency(); // destructure
  const [product, setProduct] = useState({ name: '', material: '', region: '', price: '', stock: '', description: '' });
  // ... (rest of state)

  // ... (handlers)



  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Carbon Model State
  const [showCarbonForm, setShowCarbonForm] = useState(false);
  const [carbonLoading, setCarbonLoading] = useState(false);
  const [carbonResult, setCarbonResult] = useState(null);
  const [carbonData, setCarbonData] = useState({
      material_quantity_kg: '',
      energy_used_kwh: '',
      transport_distance_km: '',
      product_weight_kg: '',
      recycled_material_percent: '',
      primary_material: 'wood',
      production_type: 'handmade'
  });

  const handleCarbonChange = (e) => {
      setCarbonData({ ...carbonData, [e.target.name]: e.target.value });
  };

  const calculateCarbon = async () => {
    setCarbonLoading(true);
    try {
        const payload = {
            ...carbonData,
            material_quantity_kg: parseFloat(carbonData.material_quantity_kg),
            energy_used_kwh: parseFloat(carbonData.energy_used_kwh),
            transport_distance_km: parseFloat(carbonData.transport_distance_km),
            product_weight_kg: parseFloat(carbonData.product_weight_kg),
            recycled_material_percent: parseFloat(carbonData.recycled_material_percent)
        };

        const response = await axios.post('/api/predict/carbon', payload);
        if (response.data.carbon_emission !== undefined) {
             setCarbonResult(response.data.carbon_emission);
             // Optionally save this to the product state if you want to store it in DB
             // setProduct(prev => ({ ...prev, carbon_footprint: response.data.carbon_emission }));
        }
    } catch (error) {
        console.error("Carbon Calc Error:", error);
        alert("Failed to calculate carbon emission. Check inputs.");
    } finally {
        setCarbonLoading(false);
    }
  };

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

  const analyzeImage = async () => {
    if (!image) {
        alert('Please upload an image first to analyze.');
        return;
    }
    setLoading(true);
    try {
        const response = await axios.post('/api/ai/analyze-image', { image, currency });
        const data = response.data;
        
        // Auto-fill fields
        setProduct(prev => ({
            ...prev,
            name: data.name || prev.name,
            material: data.material || prev.material,
            region: data.region || prev.region,
            price: data.price || prev.price,
            description: data.description || prev.description
        }));

        setPrediction(data.price);
        alert("AI Analysis Complete! Fields updated.");
        
    } catch (error) {
        console.error("AI Analysis Error:", error);
        alert("Failed to analyze image. Please try again.");
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
              description: product.description,
              imageUrl: image,
              seller: user.id, // Mongoose expects 'seller'
              carbonFootprint: carbonResult // Save the calculated carbon emission
          };

          await axios.post('/api/products', payload);
          alert('Product Added Successfully!');
          navigate('/seller/dashboard'); // Redirect to dashboard
          // Reset Form (Optional if redirecting, but good practice if nav fails or is delayed)
          setProduct({ name: '', material: '', region: '', price: '', description: '' });

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

        {/* AI Analysis Section */}
        <div className="prediction-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ margin: 0, color: '#0277bd' }}>AI Product Assistant</h4>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#555' }}>Upload an image and let AI identify details and suggest a price.</p>
                </div>
                <button onClick={analyzeImage} disabled={loading || !image} className="prediction-btn" style={{ background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)' }}>
                     {loading ? 'Analyzing...' : '✨ Analyze Image'}
                </button>
            </div>
            
            {prediction && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #b3e5fc' }}>
                     <p style={{ color: '#2E7D32', marginBottom: '0.5rem' }}><strong>Suggested Price:</strong> ${Number(prediction).toFixed(2)}</p>
                </div>
            )}
        </div>

        {/* Carbon Emission Section */}
        <div className="prediction-section" style={{ marginTop: '2rem', background: '#f0f8ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ margin: 0, color: '#2e7d32' }}>🌱 Carbon Footprint Calculator</h4>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#555' }}>Estimate the environmental impact of your product.</p>
                </div>
                <button 
                    onClick={() => setShowCarbonForm(!showCarbonForm)} 
                    className="prediction-btn" 
                    style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}
                >
                     {showCarbonForm ? 'Hide Calculator' : 'Calculate Emission'}
                </button>
            </div>

            {showCarbonForm && (
                <div className="carbon-form" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #b3e5fc' }}>
                    <div className="grid-2">
                         <div className="form-group">
                            <label>Material Qty (kg)</label>
                            <input className="form-input" type="number" name="material_quantity_kg" value={carbonData.material_quantity_kg} onChange={handleCarbonChange} />
                        </div>
                        <div className="form-group">
                            <label>Energy Used (kWh)</label>
                            <input className="form-input" type="number" name="energy_used_kwh" value={carbonData.energy_used_kwh} onChange={handleCarbonChange} />
                        </div>
                        <div className="form-group">
                            <label>Transport Dist (km)</label>
                            <input className="form-input" type="number" name="transport_distance_km" value={carbonData.transport_distance_km} onChange={handleCarbonChange} />
                        </div>
                        <div className="form-group">
                            <label>Product Weight (kg)</label>
                            <input className="form-input" type="number" name="product_weight_kg" value={carbonData.product_weight_kg} onChange={handleCarbonChange} />
                        </div>
                        <div className="form-group">
                            <label>Recycled Mat (%)</label>
                            <input className="form-input" type="number" name="recycled_material_percent" value={carbonData.recycled_material_percent} onChange={handleCarbonChange} />
                        </div>
                        <div className="form-group">
                            <label>Primary Material</label>
                            <select className="form-input" name="primary_material" value={carbonData.primary_material} onChange={handleCarbonChange}>
                                <option value="wood">Wood</option>
                                <option value="metal">Metal</option>
                                <option value="plastic">Plastic</option>
                                <option value="fabric">Fabric</option>
                                <option value="glass">Glass</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Production Type</label>
                             <select className="form-input" name="production_type" value={carbonData.production_type} onChange={handleCarbonChange}>
                                <option value="handmade">Handmade</option>
                                <option value="machine">Machine</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={calculateCarbon} disabled={carbonLoading} className="submit-btn" style={{ marginTop: '1rem', width: 'auto', padding: '0.8rem 2rem' }}>
                        {carbonLoading ? 'Calculating...' : 'Get Carbon Estimate'}
                    </button>

                    {carbonResult !== null && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                            <p style={{ color: '#2E7D32', margin: 0, fontSize: '1.1rem' }}>
                                <strong>Estimated Carbon Emission:</strong> {Number(carbonResult).toFixed(2)} kg CO2e
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="form-group">
            <label>Description (AI Generated)</label>
             <textarea 
                className="form-input"
                name="description" 
                rows="4"
                placeholder="Detailed explanation of the product..." 
                value={product.description}
                onChange={handleInputChange}
                style={{ resize: 'vertical' }}
            />
        </div>

        <div className="grid-2">
            <div className="form-group">
                <label>Price ({symbol})</label>
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
