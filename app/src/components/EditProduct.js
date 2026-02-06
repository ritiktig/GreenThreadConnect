import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AddProduct.css'; // Reuse premium styles

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({ name: '', material: '', region: '', price: '', stock: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      const p = res.data;
      setProduct({
          name: p.name,
          material: p.material,
          category: p.category || 'Other',
          region: p.region,
          price: p.price,
          stock: p.stock || 1
      });
      if (p.imageUrl) {
          setPreview(p.imageUrl);
          setImage(p.imageUrl); // Keep existing image if not changed
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch product", err);
      alert("Product not found");
      navigate('/seller/dashboard');
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
        setImage(reader.result); 
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProduct = async () => {
      setSaving(true);
      try {
          const payload = {
              name: product.name,
              category: product.category,
              material: product.material,
              region: product.region,
              price: parseFloat(product.price),
              stock: parseInt(product.stock),
              imageUrl: image // Update image if changed
          };

          await axios.patch(`/api/products/${id}`, payload);
          alert('Product Updated Successfully!');
          navigate('/seller/dashboard');
      } catch (err) {
          console.error(err);
          alert('Failed to update product');
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="add-product-container"><p>Loading Product...</p></div>;

  return (
    <div className="add-product-container">
      <div className="add-product-header">
          <h2>Edit Product</h2>
          <p>Update your product details</p>
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
                    id="edit-product-image-upload"
                />
                <label htmlFor="edit-product-image-upload" style={{ width: '100%', height: '100%', display: 'block' }}>
                    {preview ? (
                        <img src={preview} alt="Preview" className="preview-image" />
                    ) : (
                        <>
                            <div className="upload-icon">📷</div>
                            <p>Click to upload a new image</p>
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
                    value={product.material}
                    onChange={handleInputChange} 
                />
            </div>

            <div className="form-group">
                <label>Region</label>
                <input 
                    className="form-input"
                    name="region" 
                    value={product.region}
                    onChange={handleInputChange} 
                />
            </div>
        </div>

        <div className="grid-2">
            <div className="form-group">
                <label>Price ($)</label>
                <input 
                    className="form-input"
                    name="price" 
                    type="number"
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
                    value={product.stock}
                    onChange={handleInputChange} 
                />
            </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/seller/dashboard')} className="submit-btn" style={{ background: '#7f8c8d' }}>
                Cancel
            </button>
            <button onClick={handleUpdateProduct} className="submit-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>

      </div>
    </div>
  );
}

export default EditProduct;
