import React, { useState } from 'react';
import axios from 'axios';
import { FaBox, FaLayerGroup, FaGlobeAmericas, FaRulerCombined, FaWeightHanging, FaTags, FaMagic } from 'react-icons/fa';
import './PricePrediction.css';

function PricePrediction() {
  const [formData, setFormData] = useState({
    product_name: '',
    material: '',
    category: '',
    region: '',
    size_cm: '',
    weight_g: '',
    description_keywords: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/predict', formData);
      setResult(response.data.predicted_price);
    } catch (err) {
      console.error(err);
      setError('Failed to predict price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-wrapper">
      <div className="prediction-header">
        <h2><FaMagic /> AI Price Predictor</h2>
        <p>Leverage machine learning to price your artisan products competitively.</p>
      </div>
      
      <div className="prediction-container">
        <div className="form-section">
            <form onSubmit={handleSubmit} className="premium-form">
                <div className="form-group">
                    <label><FaBox /> Product Name</label>
                    <input name="product_name" value={formData.product_name} onChange={handleChange} required placeholder="e.g. Handmade Clay Pot" />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label><FaLayerGroup /> Material</label>
                        <input name="material" value={formData.material} onChange={handleChange} required placeholder="e.g. Clay" />
                    </div>
                    <div className="form-group">
                        <label><FaTags /> Category</label>
                        <input name="category" value={formData.category} onChange={handleChange} required placeholder="e.g. Kitchenware" />
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label><FaGlobeAmericas /> Region</label>
                        <input name="region" value={formData.region} onChange={handleChange} required placeholder="e.g. Rajasthan" />
                    </div>
                    <div className="form-group">
                        <label><FaRulerCombined /> Size (cm)</label>
                        <input name="size_cm" value={formData.size_cm} onChange={handleChange} required placeholder="e.g. 20x20x15" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label><FaWeightHanging /> Weight (g)</label>
                        <input name="weight_g" type="number" value={formData.weight_g} onChange={handleChange} required placeholder="e.g. 1500" />
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Description Keywords</label>
                    <textarea name="description_keywords" value={formData.description_keywords} onChange={handleChange} placeholder="e.g. handcrafted, earthy, traditional" rows="3" />
                </div>
                
                <button type="submit" disabled={loading} className="predict-btn">
                    {loading ? 'Analyzing Market...' : 'Predict Fair Price'}
                </button>
            </form>
        </div>
        
        <div className="result-section">
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Scanning market trends...</p>
                </div>
            )}
            
            {error && <div className="error-msg">{error}</div>}
            
            {!loading && !result && !error && (
                <div className="placeholder-state">
                    <p>Fill out the details to see the AI's recommendation.</p>
                </div>
            )}
            
            {result && (
                <div className="result-card fade-in">
                    <h3>Recommended Price</h3>
                    <div className="price-display">
                        <span className="currency">₹</span>
                        <span className="amount">{result}</span>
                    </div>
                    <div className="confidence-meter">
                        <span>Market Confidence</span>
                        <div className="meter-bar"><div className="fill" style={{width: '85%'}}></div></div>
                    </div>
                    <p className="note">Based on similar products in {formData.region || 'your region'}.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default PricePrediction;
