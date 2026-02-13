import React, { useState, useEffect } from 'react';
import './ProductDetails.css';
import { useCurrency } from '../context/CurrencyContext';

function ProductDetails({ product, onClose, onAddToCart }) {
  const { formatPrice } = useCurrency();
  const [isSpeaking, setIsSpeaking] = useState(false);



  useEffect(() => {
    // Stop speech when component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(product.description || "No description available for this product.");
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!product) return null;

  return (
    <div className="product-details-overlay" onClick={onClose}>
      <div className="product-details-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="details-image-section">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/500'} 
            alt={product.name} 
            className="details-image" 
          />
        </div>

        <div className="details-info-section">
          <div className="details-category">{product.category || 'Artisan Craft'}</div>
          <h1 className="details-title">{product.name}</h1>
          
          <div className="details-seller">
            <div className="seller-avatar">
                {product.seller && product.seller.name ? product.seller.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span>Created by <strong>{product.seller ? product.seller.name : 'Unknown Artisan'}</strong></span>
          </div>

          <div className="details-price">{formatPrice(product.price)}</div>

          <div className="details-description-header">
            <h3>Description</h3>
            <button className={`tts-btn ${isSpeaking ? 'active' : ''}`} onClick={toggleSpeech}>
              {isSpeaking ? '🔊 Stop Reading' : '🔊 Listen to Description'}
            </button>
          </div>

          <p className="details-description">
            {product.description || "No detailed description provided."}
          </p>

          <div className="details-actions">
            <button className="details-add-btn" onClick={() => onAddToCart(product)}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
