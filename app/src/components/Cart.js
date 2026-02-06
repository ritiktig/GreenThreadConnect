import React from 'react';

function Cart({ cart, setCart, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const handleBuyNow = () => {
    onCheckout();
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    const item = newCart[index];
    const newQuantity = (item.quantity || 1) + delta;
    
    if (newQuantity <= 0) {
      removeFromCart(index);
    } else {
      newCart[index] = { ...item, quantity: newQuantity };
      setCart(newCart);
    }
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your Cart</h2>
        <p>{cart.reduce((acc, item) => acc + (item.quantity || 1), 0)} items in your cart</p>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
          <h3>Your cart is empty</h3>
          <p>Go back to the marketplace to add some sustainable goodies!</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: '2rem' }}>
            {cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                    <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>{item.category}</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>Unit Price: ${item.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                   {/* Quantity Controls */}
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', borderRadius: '4px', padding: '0.2rem' }}>
                      <button 
                        onClick={() => updateQuantity(index, -1)}
                        style={{ width: '30px', height: '30px', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >-</button>
                      <span style={{ width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity || 1}</span>
                       <button 
                        onClick={() => updateQuantity(index, 1)}
                        style={{ width: '30px', height: '30px', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >+</button>
                   </div>

                  <span style={{ fontWeight: 'bold', color: '#27ae60', minWidth: '80px', textAlign: 'right' }}>
                    ${(item.price * (item.quantity || 1)).toFixed(2)}
                  </span>
                  
                  <button onClick={() => removeFromCart(index)} style={{ background: '#e74c3c', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
            <h3>Total: <span style={{ color: '#27ae60' }}>${total.toFixed(2)}</span></h3>
            <button onClick={handleBuyNow} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Buy Now</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
