import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css'; // We will create this or inline styles

function Checkout({ cart, setCart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  
  // New Address Form
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', zipCode: '', type: 'Home'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) {
        alert('Please login to checkout');
        navigate('/');
        return;
    }
    fetchAddresses();
  }, [user.id]);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`/api/users/${user.id}/addresses`);
      setAddresses(res.data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/users/${user.id}/addresses`, newAddress);
      alert('Address saved!');
      setShowAddAddress(false);
      fetchAddresses();
    } catch (err) {
      console.error('Error saving address:', err.response ? err.response.data : err);
      alert(`Failed to save address: ${err.message}`);
    }
  };

  const handlePlaceOrder = async () => {
     if (!selectedAddress) {
         alert('Please select an address');
         return;
     }
     if (!paymentMethod) {
         alert('Please select a payment method');
         return;
     }

     setLoading(true);
     try {
         // Create Order Payload
         const items = cart.map(item => ({
             product: item._id,
             quantity: item.quantity || 1, 
             price: item.price
         }));

         const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
         const addressString = `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zipCode}`;

         const payload = {
             buyer: user.id || user._id, // Ensure we get the ID
             items: items,
             totalAmount: totalAmount,
             shippingAddress: addressString,
             paymentMethod: paymentMethod, // Added payment method
             status: 'Paid'
         };

         console.log('🛒 Placing Order with Payload:', payload);

         await axios.post('/api/orders', payload);

         setCart([]); // Clear cart
         alert('Order Placed Successfully!');
         navigate('/buyer/history');
     } catch (err) {
         console.error(err);
         alert('Order Failed');
     } finally {
         setLoading(false);
     }
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="checkout-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Checkout</h2>
      
      {/* Progress Steps */}
      <div className="steps" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
        <div style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? '#27ae60' : '#ccc' }}>1. Address</div>
        <div style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? '#27ae60' : '#ccc' }}>2. Payment</div>
      </div>

      {step === 1 && (
        <div className="step-content">
          <h3>Select Delivery Address</h3>
          
          <div className="address-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {addresses.map(addr => (
                <div 
                    key={addr._id} 
                    onClick={() => setSelectedAddress(addr)}
                    style={{ 
                        border: selectedAddress?._id === addr._id ? '2px solid #27ae60' : '1px solid #ddd',
                        padding: '1rem', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedAddress?._id === addr._id ? '#eafaf1' : '#fff'
                    }}
                >
                    <strong>{addr.type}</strong>
                    <p>{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                </div>
            ))}
            
            <button onClick={() => setShowAddAddress(true)} style={{ border: '2px dashed #ccc', background: 'none', color: '#666', cursor: 'pointer', padding: '1rem', borderRadius: '8px' }}>
                + Add New Address
            </button>
          </div>

          {showAddAddress && (
              <div className="add-address-form" style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h4>New Address</h4>
                  <form onSubmit={handleSaveAddress} style={{ display: 'grid', gap: '0.5rem' }}>
                      <input placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} required />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required />
                        <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} required />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input placeholder="Zip Code" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} required />
                        <select value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})}>
                            <option>Home</option>
                            <option>Office</option>
                            <option>Other</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit">Save Address</button>
                        <button type="button" onClick={() => setShowAddAddress(false)} style={{ background: '#ccc' }}>Cancel</button>
                      </div>
                  </form>
              </div>
          )}
          
          <div style={{ textAlign: 'right' }}>
              <button disabled={!selectedAddress} onClick={() => setStep(2)} style={{ opacity: selectedAddress ? 1 : 0.5 }}>Next: Payment</button>
          </div>
        </div>
      )}

      {step === 2 && (
          <div className="step-content">
              <h3>Payment Method</h3>
              <p>Total Amount: <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>${total.toFixed(2)}</span></p>
              
              <div className="payment-options" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="UPI" onChange={e => setPaymentMethod(e.target.value)} />
                      <span>UPI (Google Pay, PhonePe, Paytm)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="Card" onChange={e => setPaymentMethod(e.target.value)} />
                      <span>Credit / Debit Card</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="COD" onChange={e => setPaymentMethod(e.target.value)} />
                      <span>Cash on Delivery</span>
                  </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setStep(1)} style={{ background: '#ccc' }}>Back</button>
                  <button onClick={handlePlaceOrder} disabled={!paymentMethod || loading}>
                      {loading ? 'Processing...' : 'Place Order'}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}

export default Checkout;
